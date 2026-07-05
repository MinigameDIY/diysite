export function createSvelteKitError(status: number, message: string) {
	const err = new Error(message) as any;
	err.status = status;
	err.body = { message };
	return err;
}
