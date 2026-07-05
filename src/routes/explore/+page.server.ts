import { db } from "$lib/server/db/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const minigames = db.prepare(`
    SELECT minigame.id, minigame.name, minigame.description, minigame.createdAt, minigame.userId, user.name AS ownerName
    FROM minigame
    JOIN user ON user.id = minigame.userId
    WHERE minigame.visibility = 'public'
    ORDER BY minigame.createdAt DESC
    LIMIT 25
    `).all();
  
    const collections = db.prepare(`
    SELECT collection.id, collection.name, collection.description, collection.createdAt, collection.userId, user.name AS ownerName
    FROM collection
    JOIN user ON user.id = collection.userId
    WHERE collection.visibility = 'public'
    ORDER BY collection.createdAt DESC
    LIMIT 25
    `).all();
  return { minigames, collections };
};