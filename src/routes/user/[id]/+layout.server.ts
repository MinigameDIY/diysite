import { db } from "$lib/server/db/db";
import { user } from "$lib/server/db/schema.ts";
import { eq } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
	const profileUser = await db.query.user.findFirst({
		where: eq(user.id, params.id),
		columns: { id: true, name: true, email: true, createdAt: true },
	});

	if (!profileUser) throw error(404, "User not found");

	return { profileUser };
};
