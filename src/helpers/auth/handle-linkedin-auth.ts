import puppeteer from "puppeteer";

import { LINKEDIN_SESSION_COOKIE, PUPPETEER_HEADLESS } from "../../constants";
import { saveLinkedinCookies } from "./save-linkedin-cookies";

export const handleLinkedinAuth = async (): Promise<void> => {
  if (!LINKEDIN_SESSION_COOKIE) {
    return;
  }

  const browser = await puppeteer.launch({ headless: PUPPETEER_HEADLESS });
  const page = await browser.newPage();

  await page.setCookie({
    name: "li_at",
    value: LINKEDIN_SESSION_COOKIE,
    domain: ".linkedin.com",
    path: "/",
  });

  await page.goto("https://www.linkedin.com/feed/");
  const cookies = await page.cookies();

  await saveLinkedinCookies(cookies);

  await browser.close();
};
