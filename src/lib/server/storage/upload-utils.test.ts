import { describe, it, expect } from "vitest";
import {
	VALID_VISIBILITIES,
	MAX_FILE_SIZE,
	validVisibilityOrDefault,
} from "./upload-utils";

describe("upload-utils", () => {
	describe("validVisibilityOrDefault", () => {
		it("should return 'public' when given 'public'", () => {
			expect(validVisibilityOrDefault("public")).toBe("public");
		});

		it("should return 'unlisted' when given 'unlisted'", () => {
			expect(validVisibilityOrDefault("unlisted")).toBe("unlisted");
		});

		it("should return 'private' when given 'private'", () => {
			expect(validVisibilityOrDefault("private")).toBe("private");
		});

		it("should return 'private' when given an invalid value", () => {
			expect(validVisibilityOrDefault("invalid")).toBe("private");
		});

		it("should return 'private' when given undefined", () => {
			expect(validVisibilityOrDefault(undefined)).toBe("private");
		});

		it("should return 'private' when given an empty string", () => {
			expect(validVisibilityOrDefault("")).toBe("private");
		});
	});
});
