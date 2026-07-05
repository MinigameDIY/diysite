import type { LayoutServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/auth/require-admin";

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await requireAdmin(request);

	return { user: session.user };
};
