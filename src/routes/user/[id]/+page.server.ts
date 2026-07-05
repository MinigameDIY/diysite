import type { PageServerLoad } from "./user/$types";

export const load: PageServerLoad = async ({ parent }) => {
	const { profileUser } = await parent();
	return { profileUser };
};
