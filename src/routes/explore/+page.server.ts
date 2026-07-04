import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const minigames = db.prepare(`
    SELECT minigame.id, minigame.name, minigame.description, minigame.createdAt, minigame.userId, user.name AS ownerName
    FROM minigame
    JOIN user ON user.id = minigame.userId
    WHERE minigame.visibility = 'public'
    ORDER BY minigame.createdAt DESC
    `).all();
  return { minigames };
};