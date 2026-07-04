import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const project = db.prepare(`
    SELECT project.*, user.id AS ownerId, user.name AS ownerName
    FROM project
    JOIN user ON user.id = project.userId
    WHERE project.id = ?
  `).get(params.id) as any;

  if (!project) throw error(404, "Project not found");

  const isOwner = session?.user.id === project.userId;

  if (project.visibility === "private" && !isOwner) {
    throw error(403, "This minigame is private");
  }

  return { project, isOwner };
};