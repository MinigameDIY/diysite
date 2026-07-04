import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import path from "path";
import type { RequestHandler } from "./$types";

const UPLOAD_DIR = path.resolve("store/project_uploads");

export const GET: RequestHandler = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const project = db.prepare(`SELECT * FROM project WHERE id = ?`).get(params.id) as any;

  if (!project) throw error(404, "Not found");

  const isOwner = session?.user.id === project.userId;
  const isAccessible = project.visibility !== "private" || isOwner;

  if (!isAccessible) {
    throw error(403, "This minigame is private");
  }

  const buffer = await readFile(path.join(UPLOAD_DIR, project.filePath));

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${project.name}"`,
    },
  });
};