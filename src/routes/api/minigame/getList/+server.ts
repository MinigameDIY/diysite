import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { VALID_VISIBILITIES } from "$lib/server/upload-utils";
import { requireLogin } from "$lib/server/require-login";

export const GET: RequestHandler = async ({ url, request }) => {
	const idsString = url.searchParams.get('ids');
	const minigameIds = idsString ? idsString.split(',') : [];

	const session = await auth.api.getSession({ headers: request.headers });

	const minigames = [];

	for (let i in minigameIds) {
		var minigameId = minigameIds[i];
		
		const minigame = db
			.prepare(
				`
		SELECT minigame.*, user.id AS ownerId, user.name AS ownerName
		FROM minigame
		JOIN user ON user.id = minigame.userId
		WHERE minigame.id = ?
		`,
			)
			.get(minigameId) as any;

		if (!minigame) continue;

		const isOwner = session?.user.id === minigame.userId;

		if (minigame.visibility === "private" && !isOwner) {
			continue;
		}

		minigames.push(minigame);
	}

	return new Response(JSON.stringify(minigames));
};