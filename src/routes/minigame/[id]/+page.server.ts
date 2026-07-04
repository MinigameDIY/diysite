import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const minigame = db.prepare(`
    SELECT minigame.*, user.id AS ownerId, user.name AS ownerName
    FROM minigame
    JOIN user ON user.id = minigame.userId
    WHERE minigame.id = ?
  `).get(params.id) as any;

  if (!minigame) throw error(404, "minigame not found");

  const isOwner = session?.user.id === minigame.userId;

  if (minigame.visibility === "private" && !isOwner) {
    throw error(403, "This minigame is private");
  }

  return { minigame, isOwner };
};