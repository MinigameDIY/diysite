import { describe, it, expect, beforeEach, vi } from "vitest";
import { requireAdmin } from "./require-admin";
import {
	clearMockSession,
	setMockSession,
	setMockAdminSession,
} from "../../../test-setup";

describe("requireAdmin", () => {
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

	it("should return the session when user is an admin", async () => {
		setMockAdminSession();
		const result = await requireAdmin(new Request("http://localhost"));
		expect(result).toBeDefined();
		expect(result.user.role).toBe("admin");
	});

	it("should throw a 403 error when user is not logged in", async () => {
		clearMockSession();

		try {
			await requireAdmin(new Request("http://localhost"));
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
			expect(err.body?.message).toBe("Admin only");
		}
	});

	it("should throw a 403 error when user is logged in but not admin", async () => {
		try {
			await requireAdmin(new Request("http://localhost"));
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
			expect(err.body?.message).toBe("Admin only");
		}
	});
});
