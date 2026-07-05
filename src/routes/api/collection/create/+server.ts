import { auth } from "$lib/server/auth/auth"
import { db } from "$lib/server/db/db";
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
        const createCollectionTransaction = db.transaction((
            colId: string,
            userId: string, 
            colName: string, 
            colDesc: string, 
            colVis: string, 
            gamesList: string[]
        ) => {
            db.prepare(`
                INSERT INTO collection (id, userId, name, description, visibility)
                VALUES (?, ?, ?, ?, ?)
            `).run(colId, userId, colName, colDesc, colVis);
            
            if (gamesList.length > 0) {
                const insertJunction = db.prepare(`
                    INSERT INTO collection_minigames (collection_id, minigameId)
                    VALUES (?, ?)
                `);
                for (const minigameId of gamesList) {
                    insertJunction.run(colId, minigameId);
                }
            }
        });

        createCollectionTransaction(
            collectionId,
            session.user.id,
            name,
            description,
            finalVisibility,
            minigameIds
        );

        return json({ success: true, id: collectionId });

    } catch (dbError: any) {
        console.error("Database Transaction Failure:", dbError);
        throw error(500, "Failed to create collection securely");
    }
};
