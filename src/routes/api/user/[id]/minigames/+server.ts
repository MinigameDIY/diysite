import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	const isOwner = session?.user.id === params.id;

 	const minigames = isOwner
    ? db.prepare(`
        SELECT id
        FROM minigame
        WHERE userId = ?
        ORDER BY createdAt DESC
      `).all(params.id)
    : db.prepare(`
        SELECT id
        FROM minigame
        WHERE userId = ? AND visibility = 'public'
        ORDER BY createdAt DESC
      `).all(params.id);

	return new Response(JSON.stringify(minigames.map(item => item.id)));
};