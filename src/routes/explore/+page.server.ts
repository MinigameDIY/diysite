import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const projects = db.prepare(`
    SELECT project.id, project.name, project.description, project.createdAt, project.userId, user.name AS ownerName
    FROM project
    JOIN user ON user.id = project.userId
    WHERE project.visibility = 'public'
    ORDER BY project.createdAt DESC
    `).all();
  return { projects };
};