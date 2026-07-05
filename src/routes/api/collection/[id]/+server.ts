import { auth } from "$lib/server/auth/auth"
import { db } from "$lib/server/db/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { VALID_VISIBILITIES } from "$lib/server/storage/upload-utils";
import { requireLogin } from "$lib/server/auth/require-login";

export const GET: RequestHandler = async ({ params, request }) => {
	const collectionId = params.id;

	const session = await auth.api.getSession({ headers: request.headers });

	const collection = db
		.prepare(
			`
	SELECT collection.*, user.id AS ownerId, user.name AS ownerName
	FROM collection
	JOIN user ON user.id = collection.userId
	WHERE collection.id = ?
	`,
		)
		.get(collectionId) as any;

	const collection_minigames = db
		.prepare(
			`
    SELECT collection_minigames.*
    FROM collection_minigames
    JOIN collection ON collection.id = collection_minigames.collection_id
    WHERE collection_minigames.collection_id = ?
  `,
		)
		.all(params.id) as any[];


	if (!collection || !collection_minigames) throw error(404, "Collection not found");

	const isOwner = session?.user.id === collection.userId;

	if (collection.visibility === "private" && !isOwner) {
		throw error(403, "This collection is private");
	}

	collection.minigames = collection_minigames.map(item => item.minigameId);

	return new Response(JSON.stringify(collection));
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const collection = db
		.prepare(`SELECT * FROM collection WHERE id = ?`)
		.get(params.id) as any;
	
	if (!collection) throw error(404, "collection not found");


	const collection_minigames = db
	.prepare(`
    SELECT collection_minigames.*
    FROM collection_minigames
    JOIN collection ON collection.id = collection_minigames.collection_id
    WHERE collection_minigames.collection_id = ?
  	`,).all(params.id) as any[];

	if (!collection_minigames) throw error(404, "collection_minigames not found");


	const isOwner = session.user.id === collection.userId;
	const isAdmin = session.user.role === "admin";
	if (!isOwner && !isAdmin) {
		throw error(403, "You don't have permission to edit this collection");
	}


	const body = await request.json();

	const updates: string[] = [];
	const values: any[] = [];

	if (body.name !== undefined) {
		const name = body.name?.toString().trim();
		if (!name) throw error(400, "Name cannot be empty");
		updates.push("name = ?");
		values.push(name);
	}

	if (body.description !== undefined) {
		updates.push("description = ?");
		values.push(body.description?.toString().trim() ?? "");
	}

	if (body.visibility !== undefined) {
		if (!VALID_VISIBILITIES.includes(body.visibility)) {
			throw error(400, "Invalid visibility value");
		}
		updates.push("visibility = ?");
		values.push(body.visibility);
	}

	if (body.minigames !== undefined) {
		if (!Array.isArray(body.minigames)) {
			throw error(400, "Invalid minigames array type");
		}

		
		if (body.minigames.length > 0) {
			const collection_minigame_ids = collection_minigames.map(item => item.minigameId);

			const toRemove = collection_minigame_ids.filter((value: string) => !body.minigames.includes(value));
			const toAdd = body.minigames.filter((value: string) => !collection_minigame_ids.includes(value));

			if (toRemove.length > 0) {
				const deleteCommand = db.prepare(`DELETE FROM collection_minigames WHERE collection_id = ? AND minigameId = ?`);
	
				const deleteTransaction = db.transaction((ids: string[]) => {
					for (const id of ids) {
						deleteCommand.run(params.id, id);
					}
				});
				
				deleteTransaction(toRemove);
			}

			if (toAdd.length > 0) {
				const addCommand = db.prepare(`INSERT INTO collection_minigames (collection_id, minigameId)
                    VALUES (?, ?)`);
	
				const addTransaction = db.transaction((ids: string) => {
					for (const id of ids) {
						addCommand.run(params.id, id);
					}
				});

				addTransaction(toAdd);
			}
		}
	}

	if (updates.length === 0) {
		throw error(400, "No valid fields provided to update");
	}

	values.push(params.id);

	db.prepare(
		`
	UPDATE collection
	SET ${updates.join(", ")}
	WHERE id = ?
  `,
	).run(...values);

	const updated = db
		.prepare(`SELECT * FROM collection WHERE id = ?`)
		.get(params.id);

	return json({ success: true, collection: updated });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const collection = db.prepare(`SELECT * FROM collection WHERE id = ?`).get(params.id) as any;
	
	if (!collection) throw error(404, "Collection not found");

	const isOwner = session.user.id === collection.userId;
	const isAdmin = session.user.role === "admin";

	if (!isOwner && !isAdmin)
		throw error(403, "You don't have permission to delete this collection");

	db.prepare(`DELETE FROM collection WHERE id = ?`).run(params.id);

	return json({ success: true });
};
