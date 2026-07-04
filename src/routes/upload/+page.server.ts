import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { redirect, fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { Actions, PageServerLoad } from "./$types";

const UPLOAD_DIR = path.resolve("store/project_uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_VISIBILITIES = ["public", "unlisted", "private"];

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) throw redirect(302, "/login");
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) throw redirect(302, "/login");

		const formData = await request.formData();

		const name = formData.get("name")?.toString().trim();

		const description = formData.get("description")?.toString().trim() ?? "";

		const file = formData.get("file") as File;

		if (!name) return fail(400, { error: "Name is required" });

		if (!file || file.size === 0)
			return fail(400, { error: "File is required" });

		if (!file.name.endsWith(".sb3"))
			return fail(400, { error: "Only .sb3 files are allowed" });

		if (file.size > MAX_FILE_SIZE)
			return fail(400, { error: "File must be 5MB or smaller" });

		await mkdir(UPLOAD_DIR, { recursive: true });

        const visibility = formData.get("visibility")?.toString();
        
        const finalVisibility = VALID_VISIBILITIES.includes(visibility ?? "") ? visibility : "private";

		const id = randomUUID();
		const storedFilename = `${id}`;
		const filePath = path.join(UPLOAD_DIR, storedFilename);

		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);

		db.prepare(`
        INSERT INTO project (id, userId, name, description, filePath, visibility)
        VALUES (?, ?, ?, ?, ?, ?)
        `,).run(id, session.user.id, name, description, storedFilename, finalVisibility);

		throw redirect(303, "user/" + session.user.id + "/projects");
	},
};
