import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./+server";
import { mockDb } from "../../../test-setup";

describe("GET /api/feed", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 400 for invalid feed type", async () => {
		const url = new URL(
			"http://localhost/api/feed?feed=invalid&element=minigame",
		);
		const request = new Request(url);

		try {
			await GET({ url, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Invalid feed type value");
		}
	});

	it("should return 400 for invalid element type", async () => {
		const url = new URL(
			"http://localhost/api/feed?feed=date&element=invalid",
		);
		const request = new Request(url);

		try {
			await GET({ url, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Invalid element type value");
		}
	});

	it("should return 400 when feed type is missing", async () => {
		const url = new URL("http://localhost/api/feed?element=minigame");
		const request = new Request(url);

		try {
			await GET({ url, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
		}
	});

	it("should return 400 when element type is missing", async () => {
		const url = new URL("http://localhost/api/feed?feed=date");
		const request = new Request(url);

		try {
			await GET({ url, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
		}
	});

	it("should return public minigames ordered by date", async () => {
		const mockMinigames = [
			{
				id: "mg-1",
				name: "Test Minigame",
				description: "A test",
				visibility: "public",
				createdAt: "2026-01-02",
				userId: "user-1",
				filePath: "mg-1",
				user: { id: "user-1", name: "Test User" },
			},
		];

		mockDb.query.minigame.findMany.mockResolvedValue(mockMinigames);

		const url = new URL(
			"http://localhost/api/feed?feed=date&element=minigame",
		);
		const request = new Request(url);

		const response = await GET({ url, request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0].id).toBe("mg-1");
		expect(data[0].ownerId).toBe("user-1");
		expect(data[0].ownerName).toBe("Test User");
		expect(data[0].user).toBeUndefined();
	});

	it("should return public collections ordered by date", async () => {
		const mockCollections = [
			{
				id: "col-1",
				name: "Test Collection",
				description: "A test collection",
				visibility: "public",
				createdAt: "2026-01-02",
				userId: "user-1",
				user: { id: "user-1", name: "Test User" },
			},
		];

		mockDb.query.collection.findMany.mockResolvedValue(mockCollections);

		const url = new URL(
			"http://localhost/api/feed?feed=date&element=collection",
		);
		const request = new Request(url);

		const response = await GET({ url, request } as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0].id).toBe("col-1");
		expect(data[0].ownerId).toBe("user-1");
		expect(data[0].ownerName).toBe("Test User");
		expect(data[0].user).toBeUndefined();
	});
});
