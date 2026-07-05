import { auth } from "$lib/server/auth/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ request }) => auth.handler(request);
export const POST: RequestHandler = ({ request }) => auth.handler(request);
