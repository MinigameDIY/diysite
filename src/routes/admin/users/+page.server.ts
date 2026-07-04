import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/require-admin";

export const load: PageServerLoad = async () => {
  const users = db.prepare(`SELECT id, name, email, role, createdAt FROM user ORDER BY createdAt DESC`).all();
  return { users };
};

export const actions: Actions = {
  setRole: async ({ request }) => {
    const session = requireAdmin(request);

    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    const newRole = formData.get("role")?.toString();

    if (!userId || !["user", "admin"].includes(newRole ?? "")) {
      throw error(400, "Invalid input");
    }

    db.prepare(`UPDATE user SET role = ? WHERE id = ?`).run(newRole, userId);
    return { success: true };
  },
};