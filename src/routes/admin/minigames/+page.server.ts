import { db } from "$lib/server/db/db";
import { minigame } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/auth/require-admin";

export const load: PageServerLoad = async () => {
	const minigames = await db.query.minigame.findMany({
		orderBy: [desc(minigame.createdAt)],
		with: {
			user: {
				columns: { name: true }
			}
		}
	});

	const mappedMinigames = minigames.map(m => ({
		id: m.id,
		name: m.name,
		description: m.description,
		visibility: m.visibility,
		createdAt: m.createdAt,
		userId: m.userId,
		ownerName: m.user.name,
	}));

	return { minigames: mappedMinigames };
};

export const actions: Actions = {
	setVisibility: async ({ request }) => {
		await requireAdmin(request);
		const formData = await request.formData();
		const minigameId = formData.get("minigameId")?.toString();
		const visibility = formData.get("visibility")?.toString();

		if (!minigameId || !["public", "private", "unlisted"].includes(visibility ?? "")) {
			throw error(400, "Invalid input");
		}

		await db.update(minigame).set({ visibility: visibility as "public" | "unlisted" | "private" }).where(eq(minigame.id, minigameId));
		return { success: true };
	},
};