import { auth } from "$lib/server/auth/auth"
import { db } from "$lib/server/db/db";
import { collection, collectionMinigames } from "$lib/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { VALID_VISIBILITIES } from "$lib/server/storage/upload-utils";
import { requireLogin } from "$lib/server/auth/require-login";

export const GET: RequestHandler = async ({ params, request }) => {
	const collectionId = params.id;

	const session = await auth.api.getSession({ headers: request.headers });

	const coll = await db.query.collection.findFirst({
		where: eq(collection.id, collectionId),
		with: {
			user: {
				columns: { id: true, name: true }
			}
		}
	});

	if (!coll) throw error(404, "Collection not found");

	const isOwner = session?.user.id === coll.userId;

	if (coll.visibility === "private" && !isOwner) {
		throw error(403, "This collection is private");
	}

	const collection_minigames = await db.query.collectionMinigames.findMany({
		where: eq(collectionMinigames.collectionId, collectionId),
	});

	if (!collection_minigames) throw error(404, "collection_minigames not found");

	const result = {
		id: coll.id,
		userId: coll.userId,
		name: coll.name,
		description: coll.description,
		visibility: coll.visibility,
		createdAt: coll.createdAt,
		ownerId: coll.user.id,
		ownerName: coll.user.name,
		minigames: collection_minigames.map(item => item.minigameId),
	};

	return new Response(JSON.stringify(result));
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const coll = await db.query.collection.findFirst({
		where: eq(collection.id, params.id),
	});

	if (!coll) throw error(404, "collection not found");

	const collection_minigames = await db.query.collectionMinigames.findMany({
		where: eq(collectionMinigames.collectionId, params.id),
	});

	if (!collection_minigames) throw error(404, "collection_minigames not found");

	const isOwner = session.user.id === coll.userId;
	const isAdmin = session.user.role === "admin";
	if (!isOwner && !isAdmin) {
		throw error(403, "You don't have permission to edit this collection");
	}

	const body = await request.json();

	const updates: Partial<typeof collection.$inferInsert> = {};

	if (body.name !== undefined) {
		const name = body.name?.toString().trim();
		if (!name) throw error(400, "Name cannot be empty");
		updates.name = name;
	}

	if (body.description !== undefined) {
		updates.description = body.description?.toString().trim() ?? "";
	}

	if (body.visibility !== undefined) {
		if (!VALID_VISIBILITIES.includes(body.visibility)) {
			throw error(400, "Invalid visibility value");
		}
		updates.visibility = body.visibility;
	}

	if (body.minigames !== undefined) {
		if (!Array.isArray(body.minigames)) {
			throw error(400, "Invalid minigames array type");
		}

		if (body.minigames.length > 0) {
			const collection_minigame_ids = collection_minigames.map(item => item.minigameId).filter((id): id is string => id !== null);

			const toRemove = collection_minigame_ids.filter((value) => !body.minigames.includes(value));
			const toAdd = body.minigames.filter((value: string) => !collection_minigame_ids.includes(value));

			if (toRemove.length > 0) {
				await db.transaction(async (tx) => {
					for (const id of toRemove) {
						await tx.delete(collectionMinigames)
							.where(and(eq(collectionMinigames.collectionId, params.id), eq(collectionMinigames.minigameId, id!)));
					}
				});
			}

			if (toAdd.length > 0) {
				await db.transaction(async (tx) => {
					for (const id of toAdd) {
						await tx.insert(collectionMinigames).values({ collectionId: params.id, minigameId: id });
					}
				});
			}
		}
	}

	if (Object.keys(updates).length > 0) {
		await db.update(collection).set(updates).where(eq(collection.id, params.id));
	}

	const updated = await db.query.collection.findFirst({
		where: eq(collection.id, params.id),
	});

	return json({ success: true, collection: updated });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const coll = await db.query.collection.findFirst({
		where: eq(collection.id, params.id),
	});

	if (!coll) throw error(404, "Collection not found");

	const isOwner = session.user.id === coll.userId;
	const isAdmin = session.user.role === "admin";

	if (!isOwner && !isAdmin)
		throw error(403, "You don't have permission to delete this collection");

	await db.delete(collection).where(eq(collection.id, params.id));

	return json({ success: true });
};