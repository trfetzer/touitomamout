import { writeFile } from "node:fs/promises";

import { STORAGE_DIR } from "../../constants";
import { Protocol } from "puppeteer";

const LINKEDIN_COOKIES_PATH = `${STORAGE_DIR}/linkedin.cookies.json`;

export const saveLinkedinCookies = async (
  cookies: Protocol.Network.Cookie[],
): Promise<void> => {
  try {
    await writeFile(LINKEDIN_COOKIES_PATH, JSON.stringify(cookies, null, 2));
  } catch (err) {
    console.error("Error updating linkedin cookies file:", err);
  }
};

export { LINKEDIN_COOKIES_PATH };
