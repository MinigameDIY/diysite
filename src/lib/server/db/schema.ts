import {
	sqliteTable,
	text,
	integer,
	numeric,
	index,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/relations";

export const user = sqliteTable("user", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	emailVerified: integer("emailVerified").notNull(),
	image: text("image"),
	createdAt: numeric("createdAt").notNull(),
	updatedAt: numeric("updatedAt").notNull(),
	role: text("role").default("user"),
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	minigames: many(minigame),
	collections: many(collection),
}));

export const session = sqliteTable("session", {
	id: text("id").primaryKey().notNull(),
	expiresAt: numeric("expiresAt").notNull(),
	token: text("token").notNull(),
	createdAt: numeric("createdAt").notNull(),
	updatedAt: numeric("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const account = sqliteTable("account", {
	id: text("id").primaryKey().notNull(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: numeric("accessTokenExpiresAt"),
	refreshTokenExpiresAt: numeric("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: numeric("createdAt").notNull(),
	updatedAt: numeric("updatedAt").notNull(),
});

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey().notNull(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: numeric("expiresAt").notNull(),
	createdAt: numeric("createdAt").notNull(),
	updatedAt: numeric("updatedAt").notNull(),
});

export const minigame = sqliteTable("minigame", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull(),
	description: text("description"),
	filePath: text("filePath").notNull(),
	visibility: text("visibility", { enum: ["public", "unlisted", "private"] })
		.notNull()
		.default("private"),
	createdAt: text("createdAt")
		.notNull()
		.default(sql`(datetime('now'))`),
});

export const minigameRelations = relations(minigame, ({ one }) => ({
	user: one(user, {
		fields: [minigame.userId],
		references: [user.id],
	}),
}));

export const collection = sqliteTable("collection", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull(),
	description: text("description"),
	visibility: text("visibility", { enum: ["public", "unlisted", "private"] })
		.notNull()
		.default("private"),
	createdAt: text("createdAt")
		.notNull()
		.default(sql`(datetime('now'))`),
});

export const collectionRelations = relations(collection, ({ one, many }) => ({
	user: one(user, {
		fields: [collection.userId],
		references: [user.id],
	}),
	collectionMinigames: many(collectionMinigames),
}));

export const collectionMinigames = sqliteTable(
	"collection_minigames",
	{
		collectionId: text("collection_id").references(() => collection.id, {
			onDelete: "cascade",
		}),
		minigameId: text("minigameId"),
	},
	(table) => [
		primaryKey({ columns: [table.collectionId, table.minigameId] }),
	],
);

export const collectionMinigamesRelations = relations(
	collectionMinigames,
	({ one }) => ({
		collection: one(collection, {
			fields: [collectionMinigames.collectionId],
			references: [collection.id],
		}),
	}),
);
