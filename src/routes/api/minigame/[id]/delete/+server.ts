import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import { unlink } from "fs/promises";
import path from "path";
import type { RequestHandler } from "./$types";
import { requireLogin } from "$lib/server/require-login";

const UPLOAD_DIR = path.resolve("store/minigame_uploads");

export const DELETE: RequestHandler = async ({ params, request }) => {
	const session = await requireLogin(request);

	const minigame = db.prepare(`SELECT * FROM minigame WHERE id = ?`).get(params.id) as any;
    
	if (!minigame) throw error(404, "Minigame not found");

	const isOwner = session.user.id === minigame.userId;
	const isAdmin = session.user.role === "admin";

	if (!isOwner && !isAdmin)
		throw error(403, "You don't have permission to delete this minigame");

	try {
		await unlink(path.join(UPLOAD_DIR, minigame.filePath));
	} catch (err) {
		console.error("Failed to delete file:", err);
	}

	db.prepare(`DELETE FROM minigame WHERE id = ?`).run(params.id);

	return json({ success: true });
};
