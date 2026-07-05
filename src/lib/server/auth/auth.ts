import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from "$env/static/private";
import { db } from "../db/db";

export const auth = betterAuth({
  database: db,
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