import { auth } from "$lib/server/auth/auth";
import { db } from "$lib/server/db/db";
import { collection } from "$lib/server/db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	const isOwner = session?.user.id === params.id;

	const collections = isOwner
		? await db.query.collection.findMany({
				where: eq(collection.userId, params.id),
				orderBy: [desc(collection.createdAt)],
				columns: { id: true },
			})
		: await db.query.collection.findMany({
				where: and(
					eq(collection.userId, params.id),
					eq(collection.visibility, "public"),
				),
				orderBy: [desc(collection.createdAt)],
				columns: { id: true },
			});

	return new Response(JSON.stringify(collections.map((item) => item.id)));
};
