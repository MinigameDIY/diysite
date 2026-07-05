import { db } from "$lib/server/db/db";
import { user } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/auth/require-admin";

export const load: PageServerLoad = async () => {
	const users = await db.query.user.findMany({
		columns: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
		},
		orderBy: [desc(user.createdAt)],
	});
	return { users };
};

export const actions: Actions = {
	setRole: async ({ request }) => {
		const session = await requireAdmin(request);

		const formData = await request.formData();
		const userId = formData.get("userId")?.toString();
		const newRole = formData.get("role")?.toString();

		if (!userId || !["user", "admin"].includes(newRole ?? "")) {
			throw error(400, "Invalid input");
		}

		await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
		return { success: true };
	},
};
