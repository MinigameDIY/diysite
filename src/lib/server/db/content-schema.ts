import { relations, sql } from "drizzle-orm";
import {
	sqliteTable,
	text,
	integer,
	index,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const minigame = sqliteTable(
	"minigame",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		filePath: text("file_path").notNull(),
		visibility: text("visibility", {
			enum: ["public", "unlisted", "private"],
		})
			.default("private")
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("minigame_userId_idx").on(table.userId)],
);

export const collection = sqliteTable(
	"collection",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		visibility: text("visibility", {
			enum: ["public", "unlisted", "private"],
		})
			.default("private")
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("collection_userId_idx").on(table.userId)],
);

export const collectionMinigames = sqliteTable(
	"collection_minigames",
	{
		collectionId: text("collection_id")
			.notNull()
			.references(() => collection.id, { onDelete: "cascade" }),
		minigameId: text("minigame_id")
			.notNull()
			.references(() => minigame.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.collectionId, table.minigameId] }),
		index("collectionMinigames_minigameId_idx").on(table.minigameId),
	],
);

export const minigameRelations = relations(minigame, ({ one, many }) => ({
	user: one(user, {
		fields: [minigame.userId],
		references: [user.id],
	}),
	collectionMinigames: many(collectionMinigames),
}));

export const collectionRelations = relations(collection, ({ one, many }) => ({
	user: one(user, {
		fields: [collection.userId],
		references: [user.id],
	}),
	collectionMinigames: many(collectionMinigames),
}));

export const collectionMinigamesRelations = relations(
	collectionMinigames,
	({ one }) => ({
		collection: one(collection, {
			fields: [collectionMinigames.collectionId],
			references: [collection.id],
		}),
		minigame: one(minigame, {
			fields: [collectionMinigames.minigameId],
			references: [minigame.id],
		}),
	}),
);
