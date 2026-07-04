import { auth } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const id = params.id;
  const session = await auth.api.getSession({ headers: request.headers });

  return { id, session };
};