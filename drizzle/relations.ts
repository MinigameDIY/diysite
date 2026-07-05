import { relations } from "drizzle-orm/relations";
import { user, session, account, minigame, collection, collectionMinigames } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	minigames: many(minigame),
	collections: many(collection),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const minigameRelations = relations(minigame, ({one}) => ({
	user: one(user, {
		fields: [minigame.userId],
		references: [user.id]
	}),
}));

export const collectionRelations = relations(collection, ({one, many}) => ({
	user: one(user, {
		fields: [collection.userId],
		references: [user.id]
	}),
	collectionMinigames: many(collectionMinigames),
}));

export const collectionMinigamesRelations = relations(collectionMinigames, ({one}) => ({
	collection: one(collection, {
		fields: [collectionMinigames.collectionId],
		references: [collection.id]
	}),
}));