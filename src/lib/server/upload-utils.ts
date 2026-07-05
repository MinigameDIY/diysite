import path from "path";

export const VALID_VISIBILITIES = ["public", "unlisted", "private"];

export const UPLOAD_DIR = path.resolve("store/minigame_uploads");
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validVisibilityOrDefault(visibility: string | undefined) {
    return VALID_VISIBILITIES.includes(visibility ?? "") ? visibility : "private";
}