import { auth } from "$lib/server/auth/auth"
import { db } from "$lib/server/db/db";
import { collection, collectionMinigames } from "$lib/server/db/schema";
import { error, json } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import type { RequestHandler } from "./$types";
import { requireLogin } from "$lib/server/auth/require-login";
import { validVisibilityOrDefault } from "$lib/server/storage/upload-utils";

export const POST: RequestHandler = async ({ request }) => {
    const session = await requireLogin(request);

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() ?? "";
    
    if (!name) throw error(400, "Name is required");

    const visibility = formData.get("visibility")?.toString();
    const finalVisibility = validVisibilityOrDefault(visibility);

    let minigameIds: string[] = [];
    const rawMinigames = formData.getAll("minigameIds");

    if (rawMinigames.length === 1 && typeof rawMinigames[0] === 'string' && rawMinigames[0].startsWith('[')) {
        try {
            minigameIds = JSON.parse(rawMinigames[0]);
        } catch {
            throw error(400, "Invalid JSON format for minigameIds");
        }
    } else {
        minigameIds = rawMinigames.map(id => id.toString().trim()).filter(id => id.length > 0);
    }

    const collectionId = randomUUID();

    try {
        await db.transaction(async (tx) => {
            await tx.insert(collection).values({
                id: collectionId,
                userId: session.user.id,
                name,
                description,
                visibility: finalVisibility as "public" | "unlisted" | "private",
            });
            
            if (minigameIds.length > 0) {
                for (const minigameId of minigameIds) {
                    await tx.insert(collectionMinigames).values({
                        collectionId: collectionId,
                        minigameId,
                    });
                }
            }
        });

        return json({ success: true, id: collectionId });

    } catch (dbError: any) {
        console.error("Database Transaction Failure:", dbError);
        throw error(500, "Failed to create collection securely");
    }
};