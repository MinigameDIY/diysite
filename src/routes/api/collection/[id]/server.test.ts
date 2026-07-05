import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../test-setup";

describe("GET /api/collection/[id]", () => {
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

	it("should return 404 when collection is not found", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue(null);
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([]);

		const request = new Request("http://localhost");

		try {
			await GET({
				params: { id: "nonexistent" },
				request,
				url: new URL("http://localhost"),
			} as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
			expect(err.body?.message).toBe("Collection not found");
		}
	});

	it("should return 403 when collection is private and user is not owner", async () => {
		clearMockSession();
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			name: "Private Collection",
			visibility: "private",
			userId: "other-user",
			user: { id: "other-user", name: "Other User" },
		});
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([]);

		const request = new Request("http://localhost");

		try {
			await GET({
				params: { id: "col-1" },
				request,
				url: new URL("http://localhost"),
			} as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
			expect(err.body?.message).toBe("This collection is private");
		}
	});

	it("should return the collection without minigames by default", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			name: "Test Collection",
			description: "A test",
			visibility: "public",
			createdAt: "2026-01-01",
			userId: "user-1",
			user: { id: "user-1", name: "Test User" },
		});
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([
			{ collectionId: "col-1", minigameId: "mg-1" },
		]);

		const request = new Request("http://localhost");
		const url = new URL("http://localhost");

		const response = await GET({
			params: { id: "col-1" },
			request,
			url,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.id).toBe("col-1");
		expect(data.minigames).toEqual(["mg-1"]);
	});

	it("should include full minigame data when includeMinigames param is present", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			name: "Test Collection",
			description: "A test",
			visibility: "public",
			createdAt: "2026-01-01",
			userId: "user-1",
			user: { id: "user-1", name: "Test User" },
		});
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([
			{ collectionId: "col-1", minigameId: "mg-1" },
		]);
		mockDb.query.minigame.findMany.mockResolvedValue([
			{
				id: "mg-1",
				name: "Test Minigame",
				visibility: "public",
				userId: "user-1",
				filePath: "mg-1",
				user: { id: "user-1", name: "Test User" },
			},
		]);

		const request = new Request("http://localhost");
		const url = new URL("http://localhost?includeMinigames=true");

		const response = await GET({
			params: { id: "col-1" },
			request,
			url,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(Array.isArray(data.minigames)).toBe(true);
		expect(data.minigames[0].id).toBe("mg-1");
		expect(data.minigames[0].ownerId).toBe("user-1");
	});
});

describe("PATCH /api/collection/[id]", () => {
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
			await PATCH({ params: { id: "col-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
		}
	});

	it("should return 404 when collection is not found", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue(null);
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
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			userId: "other-user",
		});
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([]);
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "Updated" }),
			headers: { "content-type": "application/json" },
		});

		try {
			await PATCH({ params: { id: "col-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
		}
	});

	it("should update collection name successfully", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			userId: "user-1",
		});
		mockDb.query.collectionMinigames.findMany.mockResolvedValue([]);
		const request = new Request("http://localhost", {
			method: "PATCH",
			body: JSON.stringify({ name: "Updated Name" }),
			headers: { "content-type": "application/json" },
		});

		const response = await PATCH({
			params: { id: "col-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
	});
});

describe("DELETE /api/collection/[id]", () => {
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
			await DELETE({ params: { id: "col-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(401);
		}
	});

	it("should return 404 when collection is not found", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue(null);
		const request = new Request("http://localhost", { method: "DELETE" });

		try {
			await DELETE({ params: { id: "nonexistent" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
		}
	});

	it("should return 403 when not owner or admin", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			userId: "other-user",
		});
		const request = new Request("http://localhost", { method: "DELETE" });

		try {
			await DELETE({ params: { id: "col-1" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(403);
		}
	});

	it("should delete collection successfully", async () => {
		mockDb.query.collection.findFirst.mockResolvedValue({
			id: "col-1",
			userId: "user-1",
		});
		const request = new Request("http://localhost", { method: "DELETE" });

		const response = await DELETE({
			params: { id: "col-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
	});
});
