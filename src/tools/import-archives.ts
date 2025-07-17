import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { Platform, BlueskyCacheChunk, MastodonCacheChunk } from "../types";
import { getCache } from "../helpers/cache/get-cache";
import { savePostToCache } from "../helpers/cache/save-post-to-cache";
import { updateCacheEntry } from "../helpers/cache/update-cache-entry";

interface TweetEntry {
  id: string;
  text: string;
  inReplyToStatusId?: string;
  quotedStatusId?: string;
}

interface MastodonEntry {
  id: string;
  text: string;
  inReplyToId?: string;
}

interface BlueskyEntry {
  uri: string;
  cid: string;
  rkey: string;
  text: string;
  replyUri?: string;
}

const normalize = (text: string): string => text.replace(/\s+/g, " ").trim();

const parseTwitterFile = (path: string): TweetEntry[] => {
  if (!existsSync(path)) throw new Error(`File not found: ${path}`);
  const raw = readFileSync(path, "utf-8");
  const jsonText = raw.slice(raw.indexOf("[")).trim();
  const data = JSON.parse(jsonText);
  const tweets: TweetEntry[] = [];
  for (const item of data) {
    const t = item.tweet ?? item.note_tweet?.tweet;
    if (!t) continue;
    tweets.push({
      id: t.id_str,
      text: t.full_text || t.full_text_note || t.text || "",
      inReplyToStatusId: t.in_reply_to_status_id_str,
      quotedStatusId: t.quoted_status_id_str,
    });
  }
  return tweets;
};

const parseMastodonOutbox = (path: string): MastodonEntry[] => {
  if (!existsSync(path)) throw new Error(`File not found: ${path}`);
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const items = raw.orderedItems || raw.items || [];
  const posts: MastodonEntry[] = [];
  for (const it of items) {
    const obj = it.object || it;
    if (!obj || obj.type !== "Note") continue;
    const text = obj.content || "";
    posts.push({ id: obj.id, text, inReplyToId: obj.inReplyTo });
  }
  return posts;
};

const parseBlueskyExport = (folder: string): BlueskyEntry[] => {
  if (!existsSync(folder)) throw new Error(`Folder not found: ${folder}`);
  const files = readdirSync(folder).filter((f) => f.endsWith(".json"));
  const posts: BlueskyEntry[] = [];
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf-8"));
    if (!data || !data.value) continue;
    posts.push({
      uri: data.uri,
      cid: data.cid,
      rkey: data.uri.split("/").pop() ?? "",
      text: data.value.text || "",
      replyUri: data.value.reply?.parent?.uri,
    });
  }
  return posts;
};

const main = async () => {
  const rl = createInterface({ input, output });
  try {
    const tweetsPath = await rl.question("Path to tweets.js: ");
    const notesPath = await rl.question(
      "Path to note-tweet.js (optional, press enter to skip): ",
    );
    const outboxPath = await rl.question("Path to Mastodon outbox.json: ");
    const blueskyFolder = await rl.question("Path to Bluesky export folder: ");
    rl.close();

    const tweets = [
      ...parseTwitterFile(tweetsPath),
      ...(notesPath ? parseTwitterFile(notesPath) : []),
    ];
    const mastodonPosts = parseMastodonOutbox(outboxPath);
    const blueskyPosts = parseBlueskyExport(blueskyFolder);

    const mastodonMap = new Map(
      mastodonPosts.map((p) => [normalize(p.text), p]),
    );
    const blueskyMap = new Map(blueskyPosts.map((p) => [normalize(p.text), p]));

    const cache = await getCache();
    for (const tweet of tweets) {
      const key = normalize(tweet.text);
      const masto = mastodonMap.get(key);
      const blue = blueskyMap.get(key);
      if (!masto && !blue) continue;

      if (masto) {
        await savePostToCache({
          tweetId: tweet.id,
          platform: Platform.MASTODON,
          data: [masto.id] as MastodonCacheChunk[],
        });
      }
      if (blue) {
        await savePostToCache({
          tweetId: tweet.id,
          platform: Platform.BLUESKY,
          data: [{ cid: blue.cid, rkey: blue.rkey }] as BlueskyCacheChunk[],
        });
      }
    }

    await updateCacheEntry("version", cache.version || "0.2");
    console.log("Cache updated");
  } catch (err) {
    rl.close();
    console.error("Error:", err instanceof Error ? err.message : err);
  }
};

main();
