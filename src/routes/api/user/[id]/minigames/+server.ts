import { auth } from "$lib/server/auth/auth";
import { db } from "$lib/server/db/db";
import { minigame } from "$lib/server/db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	const isOwner = session?.user.id === params.id;

	const minigames = isOwner
		? await db.query.minigame.findMany({
				where: eq(minigame.userId, params.id),
				orderBy: [desc(minigame.createdAt)],
				columns: { id: true },
			})
		: await db.query.minigame.findMany({
				where: and(
					eq(minigame.userId, params.id),
					eq(minigame.visibility, "public"),
				),
				orderBy: [desc(minigame.createdAt)],
				columns: { id: true },
			});

	return new Response(JSON.stringify(minigames.map((item) => item.id)));
};
