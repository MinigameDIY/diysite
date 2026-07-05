import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../../test-setup";

vi.mock("fs/promises", () => ({
	readFile: vi.fn(() => Promise.resolve(Buffer.from("test file content"))),
}));

describe("GET /api/minigame/[id]/download", () => {
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

	it("should return 404 when minigame is not found", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue(null);
		const request = new Request("http://localhost");

		try {
			await GET({ params: { id: "nonexistent" }, request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(404);
			expect(err.body?.message).toBe("Not found");
		}
	});

	it("should return 403 when minigame is private and user is not owner", async () => {
		clearMockSession();
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "Private Minigame",
			visibility: "private",
			userId: "other-user",
			filePath: "mg-1",
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

	it("should return the file when minigame is public", async () => {
		clearMockSession();
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "Public Minigame",
			visibility: "public",
			userId: "other-user",
			filePath: "mg-1",
		});
		const request = new Request("http://localhost");

		const response = await GET({ params: { id: "mg-1" }, request } as any);
		const buffer = await response.arrayBuffer();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe(
			"application/octet-stream",
		);
		expect(response.headers.get("content-disposition")).toContain(
			'filename="Public Minigame"',
		);
		expect(new TextDecoder().decode(buffer)).toBe("test file content");
	});

	it("should return the file when user is the owner of a private minigame", async () => {
		mockDb.query.minigame.findFirst.mockResolvedValue({
			id: "mg-1",
			name: "My Private Minigame",
			visibility: "private",
			userId: "user-1",
			filePath: "mg-1",
		});
		const request = new Request("http://localhost");

		const response = await GET({ params: { id: "mg-1" }, request } as any);

		expect(response.status).toBe(200);
	});
});
