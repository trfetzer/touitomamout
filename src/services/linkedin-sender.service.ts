import puppeteer from "puppeteer";
import { Ora } from "ora";

import { DEBUG, VOID } from "../constants";
import { savePostToCache } from "../helpers/cache/save-post-to-cache";
import { getPostExcerpt } from "../helpers/post/get-post-excerpt";
import { LinkedInCacheChunk, Media, Platform } from "../types";
import { mediaDownloaderService } from "./";

export const linkedinSenderService = async (
  sessionCookie: string | null,
  tweetId: string | null,
  text: string | null,
  medias: Media[],
  log: Ora,
) => {
  if (!sessionCookie || !tweetId) {
    return;
  }
  if (!text && !medias.length) {
    log.warn(
      `\uD83D\uDD17 | post skipped: no compatible media nor text to post (tweet: ${tweetId})`,
    );
    return;
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setCookie({
    name: "li_at",
    value: sessionCookie,
    domain: ".linkedin.com",
    path: "/",
  });

  log.text = `\uD83D\uDD17 | post sending: ${getPostExcerpt(text ?? VOID)}`;
  await page.goto("https://www.linkedin.com/feed/");
  await page.waitForSelector('button.share-box-feed-entry__trigger');
  await page.click('button.share-box-feed-entry__trigger');
  await page.waitForSelector('div[role="textbox"]');
  if (text) {
    await page.type('div[role="textbox"]', text);
  }

  const images = medias.filter((m) => m.type === "image" && m.url);
  for (const media of images) {
    const blob = await mediaDownloaderService(media.url!);
    const buffer = Buffer.from(await blob.arrayBuffer());
    await page.setInputFiles('input[type="file"]', {
      name: `${media.id}.png`,
      mimeType: blob.type,
      buffer,
    });
  }

  await page.click('button.share-actions__primary-action');
  await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => null);
  const postUrl = page.url();
  await browser.close();

  if (DEBUG) {
    console.log(`LinkedIn posted URL: ${postUrl}`);
  }

  await savePostToCache({
    tweetId,
    data: [postUrl] as LinkedInCacheChunk[],
    platform: Platform.LINKEDIN,
  });

  log.succeed(`\uD83D\uDD17 | post sent: ${getPostExcerpt(text ?? VOID)}`);
};
