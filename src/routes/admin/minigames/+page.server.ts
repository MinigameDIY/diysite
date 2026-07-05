import { db } from "$lib/server/db/db";
import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/auth/require-admin";

export const load: PageServerLoad = async () => {
	const minigames = db
		.prepare(
			`
			SELECT minigame.id, minigame.name, minigame.description, minigame.visibility,
			       minigame.createdAt, minigame.userId, user.name AS ownerName
			FROM minigame
			JOIN user ON user.id = minigame.userId
			ORDER BY minigame.createdAt DESC
			`
		)
		.all();

	return { minigames };
};

export const actions: Actions = {
	setVisibility: async ({ request }) => {
		requireAdmin(request);
		const formData = await request.formData();
		const minigameId = formData.get("minigameId")?.toString();
		const visibility = formData.get("visibility")?.toString();

		if (!minigameId || !["public", "private", "unlisted"].includes(visibility ?? "")) {
			throw error(400, "Invalid input");
		}

		db.prepare(`UPDATE minigame SET visibility = ? WHERE id = ?`).run(visibility, minigameId);
		return { success: true };
	},
};