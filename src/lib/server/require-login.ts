import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";

export async function requireLogin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) throw error(401, "Not logged in");

    return session;
}
