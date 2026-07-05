import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import { unlink } from "fs/promises";
import path from "path";
import type { RequestHandler } from "./$types";
import { requireLogin } from "$lib/server/require-login";

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
