import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../../test-setup";

describe("GET /api/user/[id]/collections", () => {
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

	it("should return all collection IDs when user is the owner", async () => {
		mockDb.query.collection.findMany.mockResolvedValue([
			{ id: "col-1" },
			{ id: "col-2" },
		]);

		const request = new Request("http://localhost");
		const response = await GET({
			params: { id: "user-1" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toEqual(["col-1", "col-2"]);
	});

	it("should return only public collection IDs when user is not the owner", async () => {
		clearMockSession();
		mockDb.query.collection.findMany.mockResolvedValue([{ id: "col-1" }]);

		const request = new Request("http://localhost");
		const response = await GET({
			params: { id: "other-user" },
			request,
		} as any);
		const data = JSON.parse(await response.text());

		expect(response.status).toBe(200);
		expect(data).toEqual(["col-1"]);
	});

	it("should return an empty array when user has no collections", async () => {
		mockDb.query.collection.findMany.mockResolvedValue([]);

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
