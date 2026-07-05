import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../../test-setup";

describe("GET /api/user/[id]/minigames", () => {
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

	it("should return all public minigame IDs", async () => {
		mockDb.query.minigame.findMany.mockResolvedValue([
			{ id: "mg-1" },
			{ id: "mg-2" },
			{ id: "mg-3" },
		]);

		const request = new Request("http://localhost");
		const response = await GET({
			params: { id: "user-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toEqual(["mg-1", "mg-2", "mg-3"]);
	});

	it("should return an empty array when user has no minigames", async () => {
		mockDb.query.minigame.findMany.mockResolvedValue([]);

		const request = new Request("http://localhost");
		const response = await GET({
			params: { id: "user-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toEqual([]);
	});
});
