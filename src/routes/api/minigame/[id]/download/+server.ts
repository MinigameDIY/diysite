import { auth } from "$lib/server/auth/auth";
import { db } from "$lib/server/db/db";
import { minigame } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import path from "path";
import type { RequestHandler } from "./$types";

const UPLOAD_DIR = path.resolve("store/minigame_uploads");

export const GET: RequestHandler = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	const game = await db.query.minigame.findFirst({
		where: eq(minigame.id, params.id),
	});

	if (!game) throw error(404, "Not found");

	const isOwner = session?.user.id === game.userId;
	const isAccessible = game.visibility !== "private" || isOwner;

	if (!isAccessible) {
		throw error(403, "This minigame is private");
	}

	const buffer = await readFile(path.join(UPLOAD_DIR, game.filePath));

	return new Response(buffer, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Disposition": `attachment; filename="${game.name}"`,
		},
	});
};
