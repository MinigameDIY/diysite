import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../test-setup";

const { mockUnlink } = vi.hoisted(() => ({
	mockUnlink: vi.fn(() => Promise.resolve()),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
	const actual = await importOriginal<typeof import("fs/promises")>();
	return {
		default: {
			...actual,
			unlink: mockUnlink,
		},
	};
});

import fs from "node:fs/promises";

describe("GET /api/minigame/[id]", () => {
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

	it("should return 400 when ID is missing", async () => {
		const request = new Request("http://localhost");

		try {
			await GET({ params: { id: "" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Missing ID");
		}
	});

	it("should return 404 when minigame is not found", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue(null);
		const request = new Request("http://localhost");

		try {
			await GET({ params: { id: "nonexistent" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
			expect(err.body?.message).toBe("minigame not found");
		}
	});

	it("should return 403 when minigame is private and user is not owner", async () => {
		clearMockSession();
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "Private Minigame",
			visibility: "private",
			userId: "other-user",
			user: { id: "other-user", name: "Other User" },
		});

		const request = new Request("http://localhost");

		try {
			await GET({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
			expect(err.body?.message).toBe("This minigame is private");
		}
	});

	it("should return the minigame when user is the owner (private)", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "My Private Minigame",
			description: "A private game",
			visibility: "private",
			createdAt: "2026-01-01",
			userId: "user-1",
			filePath: "mg-1",
			user: { id: "user-1", name: "Test User" },
		});

		const request = new Request("http://localhost");
		const response = await GET({ params: { id: "mg-1" }, request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.id).toBe("mg-1");
		expect(data.ownerId).toBe("user-1");
		expect(data.ownerName).toBe("Test User");
		expect(data.user).toBeUndefined();
	});

	it("should return the minigame when it is public", async () => {
		clearMockSession();
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "Public Minigame",
			description: "A public game",
			visibility: "public",
			createdAt: "2026-01-01",
			userId: "other-user",
			filePath: "mg-1",
			user: { id: "other-user", name: "Other User" },
		});

		const request = new Request("http://localhost");
		const response = await GET({ params: { id: "mg-1" }, request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.id).toBe("mg-1");
	});
});

describe("PATCH /api/minigame/[id]", () => {
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
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "Updated" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
		}
	});

	it("should return 404 when minigame is not found", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue(null);
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "Updated" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "nonexistent" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
		}
	});

	it("should return 403 when not owner or admin", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "other-user",
		});
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "Updated" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
		}
	});

	it("should return 400 when name is empty", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "user-1",
		});
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Name cannot be empty");
		}
	});

	it("should return 400 when visibility is invalid", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "user-1",
		});
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ visibility: "super-secret" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Invalid visibility value");
		}
	});

	it("should return 400 when no valid fields provided", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "user-1",
		});
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({}),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe(
				"No valid fields provided to update",
			);
		}
	});

	it("should update the minigame successfully", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "user-1",
		});
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({
				name: "Updated Name",
				description: "New desc",
			}),
			headers: { "content-type": "application/json" },
		});

		const response = await PATCH({
			params: { id: "mg-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
	});
});

describe("DELETE /api/minigame/[id]", () => {
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
		const request = new Request("http://localhost", { method: "DELETE" });

		try {
			await DELETE({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
		}
	});

	it("should return 404 when minigame is not found", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue(null);
		const request = new Request("http://localhost", { method: "DELETE" });

		try {
			await DELETE({ params: { id: "nonexistent" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
		}
	});

	it("should return 403 when not owner or admin", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "other-user",
		});
		const request = new Request("http://localhost", { method: "DELETE" });

		try {
			await DELETE({ params: { id: "mg-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
		}
	});

	it("should delete the minigame successfully", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			userId: "user-1",
			filePath: "mg-1",
		});
		const request = new Request("http://localhost", { method: "DELETE" });

		const response = await DELETE({
			params: { id: "mg-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("mg-1"));
	});
});
