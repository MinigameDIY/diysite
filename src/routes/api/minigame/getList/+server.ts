import { auth } from "$lib/server/auth/auth"
import { db } from "$lib/server/db/db";
import { minigame } from "$lib/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { VALID_VISIBILITIES } from "$lib/server/storage/upload-utils";
import { requireLogin } from "$lib/server/auth/require-login";

export const GET: RequestHandler = async ({ url, request }) => {
	const idsString = url.searchParams.get('ids');
	const minigameIds = idsString ? idsString.split(',') : [];

	const session = await auth.api.getSession({ headers: request.headers });

	if (minigameIds.length === 0) {
		return new Response(JSON.stringify([]));
	}

	const minigames = await db.query.minigame.findMany({
		where: inArray(minigame.id, minigameIds),
		with: {
			user: {
				columns: { id: true, name: true }
			}
		}
	});

	const filtered = minigames.filter(g => {
		const isOwner = session?.user.id === g.userId;
		return g.visibility !== "private" || isOwner;
	});

	const mapped = filtered.map(g => ({
		...g,
		ownerId: g.user.id,
		ownerName: g.user.name,
		user: undefined
	}));

	return new Response(JSON.stringify(mapped));
};