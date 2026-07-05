import { sqliteTable, AnySQLiteColumn, check, text, integer, numeric, index, foreignKey, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer().notNull(),
	image: text(),
	createdAt: numeric().notNull(),
	updatedAt: numeric().notNull(),
	role: text(),
},
(table) => [
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: numeric().notNull(),
	token: text().notNull(),
	createdAt: numeric().notNull(),
	updatedAt: numeric().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	index("session_userId_idx").on(table.userId),
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: numeric(),
	refreshTokenExpiresAt: numeric(),
	scope: text(),
	password: text(),
	createdAt: numeric().notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	index("account_userId_idx").on(table.userId),
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: numeric().notNull(),
	createdAt: numeric().notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	index("verification_identifier_idx").on(table.identifier),
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const minigame = sqliteTable("minigame", {
	id: text().primaryKey(),
	userId: text().notNull().references(() => user.id),
	name: text().notNull(),
	description: text(),
	filePath: text().notNull(),
	visibility: text().default("private").notNull(),
	createdAt: text().default("sql`(datetime('now'))`").notNull(),
},
(table) => [
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const collection = sqliteTable("collection", {
	id: text().primaryKey(),
	userId: text().notNull().references(() => user.id),
	name: text().notNull(),
	description: text(),
	visibility: text().default("private").notNull(),
	createdAt: text().default("sql`(datetime('now'))`").notNull(),
},
(table) => [
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

export const collectionMinigames = sqliteTable("collection_minigames", {
	collectionId: text("collection_id").references(() => collection.id, { onDelete: "cascade" } ),
	minigameId: text(),
},
(table) => [
	primaryKey({ columns: [table.collectionId, table.minigameId], name: "collection_minigames_collection_id_minigameId_pk"})
	check("minigame_check_1", sql`visibility IN ('public', 'unlisted', 'private'`),
	check("collection_check_2", sql`visibility IN ('public', 'unlisted', 'private'`),
]);

