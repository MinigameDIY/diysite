import { vi } from "vitest";

vi.mock("$env/static/private", () => ({
	BETTER_AUTH_SECRET: "test-secret",
	BETTER_AUTH_URL: "http://localhost:5173",
}));

vi.mock("@sveltejs/kit", () => ({
	error: (status: number, message: string) => {
		const err = new Error(message) as any;
		err.status = status;
		err.body = { message };
		throw err;
	},
	json: (data: any, init?: ResponseInit) => {
		return new Response(JSON.stringify(data), {
			status: init?.status ?? 200,
			headers: { "content-type": "application/json" },
		});
	},
}));

const { mockGetSession } = vi.hoisted(() => {
	const mockGetSession = vi.fn();
	return { mockGetSession };
});

vi.mock("$lib/server/auth/auth", () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

const mockDb = {
	query: {
		minigame: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
		},
		collection: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
		},
		collectionMinigames: {
			findMany: vi.fn(),
		},
		user: {
			findFirst: vi.fn(),
		},
	},
	insert: vi.fn(() => ({
		values: vi.fn(() => Promise.resolve()),
	})),
	update: vi.fn(() => ({
		set: vi.fn(() => ({
			where: vi.fn(() => ({
				returning: vi.fn(() => [{}]),
			})),
		})),
		where: vi.fn(() => Promise.resolve()),
	})),
	delete: vi.fn(() => ({
		where: vi.fn(() => Promise.resolve()),
	})),
	transaction: vi.fn(async (cb: (tx: any) => Promise<void>) => {
		const tx = {
			insert: vi.fn(() => ({
				values: vi.fn(() => Promise.resolve()),
			})),
			delete: vi.fn(() => ({
				where: vi.fn(() => Promise.resolve()),
			})),
		};
		await cb(tx);
	}),
};

vi.mock("$lib/server/db/db", () => ({
	db: mockDb,
}));

const mockSession = {
	user: {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		role: "user",
	},
	session: {
		id: "session-1",
	},
};

export function setMockSession(session: typeof mockSession | null): void {
	mockGetSession.mockResolvedValue(session);
}

export function setMockAdminSession(): void {
	mockGetSession.mockResolvedValue({
		...mockSession,
		user: { ...mockSession.user, role: "admin" },
	});
}

export function clearMockSession(): void {
	mockGetSession.mockResolvedValue(null);
}

export { mockDb, mockGetSession };
