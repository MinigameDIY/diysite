import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request, parent }) => {
  const { profileUser } = await parent();
  const session = await auth.api.getSession({ headers: request.headers });

  const isOwnProfile = session?.user.id === profileUser.id;

  const projects = isOwnProfile
    ? db.prepare(`
        SELECT id, name, description, visibility, createdAt
        FROM project
        WHERE userId = ?
        ORDER BY createdAt DESC
      `).all(params.id)
    : db.prepare(`
        SELECT id, name, description, visibility, createdAt
        FROM project
        WHERE userId = ? AND visibility = 'public'
        ORDER BY createdAt DESC
      `).all(params.id);

  return { projects, isOwnProfile };
};