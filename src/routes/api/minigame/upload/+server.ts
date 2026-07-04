import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { RequestHandler } from "./$types";

const UPLOAD_DIR = path.resolve("store/minigame_uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_VISIBILITIES = ["public", "unlisted", "private"];

export const POST: RequestHandler = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw error(401, "Not logged in");

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() ?? "";
    const file = formData.get("file") as File;

    if (!name) throw error(400, "Name is required");
    if (!file || file.size === 0) throw error(400, "File is required");
    if (!file.name.endsWith(".sb3")) throw error(400, "Only .sb3 files are allowed");
    if (file.size > MAX_FILE_SIZE) throw error(400, "File must be 5MB or smaller");

    const visibility = formData.get("visibility")?.toString();
    const finalVisibility = VALID_VISIBILITIES.includes(visibility ?? "")
    ? visibility
    : "private";

    await mkdir(UPLOAD_DIR, { recursive: true });

    const id = randomUUID();
    const storedFilename = id;
    const filePath = path.join(UPLOAD_DIR, storedFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    db.prepare(`
    INSERT INTO minigame (id, userId, name, description, filePath, visibility)
    VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, session.user.id, name, description, storedFilename, finalVisibility);

    return json({ success: true, id });
};