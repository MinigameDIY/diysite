import { auth } from "$lib/server/auth/auth";
import { db } from "$lib/server/db/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request, parent }) => {
	const { profileUser } = await parent();
	const session = await auth.api.getSession({ headers: request.headers });
	const id = profileUser.id;
	const isOwnProfile = session?.user.id === profileUser.id;

	return { isOwnProfile, id };
};
