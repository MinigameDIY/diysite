import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../test-setup";

describe("POST /api/collection/create", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setMockSession({
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				role: "user",
			},
			session: { id: "session-1" },
		});
	});

	it("should return 401 when not logged in", async () => {
		clearMockSession();

		const formData = new FormData();
		formData.append("name", "Test Collection");

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
		}
	});

	it("should return 400 when name is missing", async () => {
		const formData = new FormData();

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Name is required");
		}
	});

	it("should create a collection with just a name", async () => {
		const formData = new FormData();
		formData.append("name", "Test Collection");

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		const response = await POST({ request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.id).toBeDefined();
	});

	it("should create a collection with minigame IDs as JSON array", async () => {
		const formData = new FormData();
		formData.append("name", "Test Collection");
		formData.append("description", "A test collection");
		formData.append("visibility", "public");
		formData.append("minigameIds", JSON.stringify(["mg-1", "mg-2"]));

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		const response = await POST({ request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
	});

	it("should create a collection with minigame IDs as multiple form fields", async () => {
		const formData = new FormData();
		formData.append("name", "Test Collection");
		formData.append("minigameIds", "mg-1");
		formData.append("minigameIds", "mg-2");

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		const response = await POST({ request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
	});

	it("should return 400 when minigameIds is invalid JSON", async () => {
		const formData = new FormData();
		formData.append("name", "Test Collection");
		formData.append("minigameIds", "[invalid json");

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe(
				"Invalid JSON format for minigameIds",
			);
		}
	});
});
