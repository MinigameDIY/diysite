import { auth } from "$lib/server/auth/auth";
import { error } from "@sveltejs/kit";

export async function requireAdmin(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session || session.user.role !== "admin")
        throw error(403, "Admin only");

	return session;
}
