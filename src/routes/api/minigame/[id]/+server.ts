import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { VALID_VISIBILITIES } from "$lib/server/upload-utils";
import { requireLogin } from "$lib/server/require-login";

export const GET: RequestHandler = async ({ params, request }) => {
	const minigameId = params.id;

	const session = await auth.api.getSession({ headers: request.headers });

	const minigame = db
		.prepare(
			`
	SELECT minigame.*, user.id AS ownerId, user.name AS ownerName
	FROM minigame
	JOIN user ON user.id = minigame.userId
	WHERE minigame.id = ?
	`,
		)
		.get(params.id) as any;

	if (!minigame) throw error(404, "minigame not found");

	const isOwner = session?.user.id === minigame.userId;

	if (minigame.visibility === "private" && !isOwner) {
		throw error(403, "This minigame is private");
	}

	return new Response(JSON.stringify(minigame));
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const minigame = db
		.prepare(`SELECT * FROM minigame WHERE id = ?`)
		.get(params.id) as any;
	if (!minigame) throw error(404, "Minigame not found");

	const isOwner = session.user.id === minigame.userId;
	const isAdmin = session.user.role === "admin";
	if (!isOwner && !isAdmin) {
		throw error(403, "You don't have permission to edit this minigame");
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

	if (updates.length === 0) {
		throw error(400, "No valid fields provided to update");
	}

	values.push(params.id);

	db.prepare(
		`
    UPDATE minigame
    SET ${updates.join(", ")}
    WHERE id = ?
  `,
	).run(...values);

	const updated = db
		.prepare(`SELECT * FROM minigame WHERE id = ?`)
		.get(params.id);

	return json({ success: true, minigame: updated });
};
