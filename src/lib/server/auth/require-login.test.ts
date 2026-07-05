import { describe, it, expect, beforeEach, vi } from "vitest";
import { requireLogin } from "./require-login";
import { clearMockSession, setMockSession } from "../../../test-setup";

describe("requireLogin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setMockSession({
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				role: "user",
			},
			session: {
				id: "session-1",
			},
		});
	});

	it("should return the session when user is logged in", async () => {
		const result = await requireLogin(new Request("http://localhost"));
		expect(result).toBeDefined();
		expect(result.user.id).toBe("user-1");
		expect(result.user.name).toBe("Test User");
	});

	it("should throw a 401 error when user is not logged in", async () => {
		clearMockSession();

		try {
			await requireLogin(new Request("http://localhost"));
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
			expect(err.body?.message).toBe("Not logged in");
		}
	});
});
