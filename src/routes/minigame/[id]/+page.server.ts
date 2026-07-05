import { auth } from "$lib/server/auth/auth"
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const user = session?.user;
  const id = params.id;

  return { id, user };
};
