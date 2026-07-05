import { auth } from "$lib/server/auth/auth";
import { db } from "$lib/server/db/db";
import { minigame, collectionMinigames } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
	VALID_VISIBILITIES,
	UPLOAD_DIR,
} from "$lib/server/storage/upload-utils";
import { requireLogin } from "$lib/server/auth/require-login";
import fs from "node:fs/promises";
import path from "node:path";

export const GET: RequestHandler = async ({ params, request }) => {
	const minigameId = params.id;
	if (!minigameId) throw error(400, "Missing ID");

	const session = await auth.api.getSession({ headers: request.headers });

	const game = await db.query.minigame.findFirst({
		where: eq(minigame.id, minigameId),
		with: {
			user: {
				columns: { id: true, name: true },
			},
		},
	});

	if (!game) throw error(404, "minigame not found");

	const isOwner = session?.user.id === game.userId;

	if (game.visibility === "private" && !isOwner) {
		throw error(403, "This minigame is private");
	}

	return json({
		...game,
		ownerId: game.user.id,
		ownerName: game.user.name,
		user: undefined,
	});
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);
	const minigameId = params.id;
	if (!minigameId) throw error(400, "Missing ID");

	const game = await db.query.minigame.findFirst({
		where: eq(minigame.id, minigameId),
	});
	if (!game) throw error(404, "Minigame not found");

	const isOwner = session.user.id === game.userId;
	const isAdmin = session.user.role === "admin";
	if (!isOwner && !isAdmin) {
		throw error(403, "You don't have permission to edit this minigame");
	}

	const body = await request.json();

	const updateFields: Partial<typeof minigame.$inferInsert> = {};

	if (body.name !== undefined) {
		const name = body.name?.toString().trim();
		if (!name) throw error(400, "Name cannot be empty");
		updateFields.name = name;
	}

	if (body.description !== undefined) {
		updateFields.description = body.description?.toString().trim() ?? "";
	}

	if (body.visibility !== undefined) {
		if (!VALID_VISIBILITIES.includes(body.visibility)) {
			throw error(400, "Invalid visibility value");
		}
		updateFields.visibility = body.visibility;
	}

	if (Object.keys(updateFields).length === 0) {
		throw error(400, "No valid fields provided to update");
	}

	const [updatedGame] = await db
		.update(minigame)
		.set(updateFields)
		.where(eq(minigame.id, minigameId))
		.returning();

	return json({ success: true, minigame: updatedGame });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);
	const minigameId = params.id;
	if (!minigameId) throw error(400, "Missing ID");

	const game = await db.query.minigame.findFirst({
		where: eq(minigame.id, minigameId),
	});
	if (!game) throw error(404, "Minigame not found");

	const isOwner = session.user.id === game.userId;
	const isAdmin = session.user.role === "admin";
	if (!isOwner && !isAdmin) {
		throw error(403, "You don't have permission to delete this minigame");
	}

	try {
		await fs.unlink(path.join(UPLOAD_DIR, game.filePath));
	} catch (err) {
		console.error("Failed to delete file:", err);
	}

	await db.transaction(async (tx) => {
		await tx.delete(minigame).where(eq(minigame.id, minigameId));
		await tx
			.delete(collectionMinigames)
			.where(eq(collectionMinigames.minigameId, minigameId));
	});

	return json({ success: true });
};
