import { db } from "$lib/server/db/db";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
  const user = db.prepare(`
    SELECT id, name, email, createdAt
    FROM user
    WHERE id = ?
  `).get(params.id) as any;

  if (!user) throw error(404, "User not found");

  return { profileUser: user };
};