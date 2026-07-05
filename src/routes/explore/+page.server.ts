import { db } from "$lib/server/db/db";
import { minigame, collection, user } from "$lib/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const minigames = await db.query.minigame.findMany({
        where: eq(minigame.visibility, 'public'),
        orderBy: [desc(minigame.createdAt)],
        limit: 25,
        with: {
            user: {
                columns: { name: true }
            }
        }
    });

    const collections = await db.query.collection.findMany({
        where: eq(collection.visibility, 'public'),
        orderBy: [desc(collection.createdAt)],
        limit: 25,
        with: {
            user: {
                columns: { name: true }
            }
        }
    });

    const mappedMinigames = minigames.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        createdAt: m.createdAt,
        userId: m.userId,
        ownerName: m.user.name,
    }));

    const mappedCollections = collections.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
        userId: c.userId,
        ownerName: c.user.name,
    }));

    return { minigames: mappedMinigames, collections: mappedCollections };
};