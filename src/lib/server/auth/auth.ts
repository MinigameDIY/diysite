import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as schema from "../db/schema";
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from "$env/static/private";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_URL,
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false,
			},
		},
	},
});
