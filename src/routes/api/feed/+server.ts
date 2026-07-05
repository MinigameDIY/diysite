import { db } from "$lib/server/db/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { eq, desc, and } from "drizzle-orm";
import { minigame, collection, user } from "$lib/server/db/schema";

const VALID_FEED_TYPES: string[] = ['date'];
const VALID_ELEMENT_TYPES = {
	'minigame': [db.query.minigame, minigame],
	'collection': [db.query.collection, collection]
} as const;

export const GET: RequestHandler = async ({ url }) => {
	const feedType = url.searchParams.get('feed');
	const elementType = url.searchParams.get('element');

	if (!feedType || !VALID_FEED_TYPES.includes(feedType))
		throw error(400, "Invalid feed type value");

	if (!elementType || !Object.keys(VALID_ELEMENT_TYPES).includes(elementType))
		throw error(400, "Invalid element type value");

	let elements: any;

	if (elementType === 'minigame') {
		elements = await db.query.minigame.findMany({
			where: eq(minigame.visibility, 'public'),
			orderBy: [desc(minigame.createdAt)],
			limit: 25,
			with: {
				user: {
					columns: { name: true }
				}
			}
		});
	} else if (elementType === 'collection') {
		elements = await db.query.collection.findMany({
			where: eq(collection.visibility, 'public'),
			orderBy: [desc(collection.createdAt)],
			limit: 25,
			with: {
				user: {
					columns: { name: true }
				}
			}
		});
	}

	const mapped = elements.map(g => ({
		...g,
		ownerId: g.user.id,
		ownerName: g.user.name,
		user: undefined
	}));

	return new Response(JSON.stringify(mapped));
};