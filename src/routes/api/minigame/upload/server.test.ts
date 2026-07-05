import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./+server";
import {
	mockDb,
	clearMockSession,
	setMockSession,
} from "../../../../test-setup";

vi.mock("fs/promises", () => ({
	mkdir: vi.fn(() => Promise.resolve()),
	writeFile: vi.fn(() => Promise.resolve()),
}));

function createMockFile(
	name: string,
	size: number,
	type = "application/octet-stream",
): File {
	const blob = new Blob([new Uint8Array(size)]);
	return new File([blob], name, { type });
}

describe("POST /api/minigame/upload", () => {
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
		formData.append("name", "Test Minigame");
		formData.append("file", createMockFile("test.sb3", 100));

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
		formData.append("file", createMockFile("test.sb3", 100));

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

	it("should return 400 when file is missing", async () => {
		const formData = new FormData();
		formData.append("name", "Test Minigame");

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("File is required");
		}
	});

	it("should return 400 when file has wrong extension", async () => {
		const formData = new FormData();
		formData.append("name", "Test Minigame");
		formData.append("file", createMockFile("test.exe", 100));

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("Only .sb3 files are allowed");
		}
	});

	it("should return 400 when file is too large", async () => {
		const formData = new FormData();
		formData.append("name", "Test Minigame");
		formData.append("file", createMockFile("test.sb3", 6 * 1024 * 1024));

		const request = new Request("http://localhost", {
			method: "POST",
			body: formData,
		});

		try {
			await POST({ request } as any);
			expect.unreachable("Should have thrown an error");
		} catch (err: any) {
			expect(err.status).toBe(400);
			expect(err.body?.message).toBe("File must be 5MB or smaller");
		}
	});

	it("should upload a minigame successfully", async () => {
		const formData = new FormData();
		formData.append("name", "Test Minigame");
		formData.append("description", "A test minigame");
		formData.append("file", createMockFile("test.sb3", 100));

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
});
