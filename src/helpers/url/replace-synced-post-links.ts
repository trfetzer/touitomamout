import { MASTODON_INSTANCE } from "../../constants";
import { Platform, BlueskyCacheChunk } from "../../types";
import { getCachedPosts } from "../cache/get-cached-posts";

export const replaceSyncedPostLinks = async (
  text: string,
  urls: string[],
  platform: Platform,
  username: string,
): Promise<{ text: string; urls: string[] }> => {
  const cachedPosts = await getCachedPosts();
  const TWITTER_STATUS_LINK = /https:\/\/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/g;

  let replacedText = text;
  const updatedUrls = [...urls];

  for (const match of text.matchAll(TWITTER_STATUS_LINK)) {
    const tweetId = match[1];
    const cached = cachedPosts[tweetId]?.[platform];
    if (!cached) continue;

    let newUrl: string | undefined;
    if (platform === Platform.MASTODON) {
      const ids = cached as string[];
      const cachedId = ids[ids.length - 1];
      newUrl = `https://${MASTODON_INSTANCE}/@${username}/${cachedId}`;
    } else if (platform === Platform.BLUESKY) {
      const chunks = cached as BlueskyCacheChunk[];
      const { rkey } = chunks[chunks.length - 1];
      newUrl = `https://bsky.app/profile/${username}/post/${rkey}`;
    }

    if (newUrl) {
      replacedText = replacedText.replaceAll(match[0], newUrl);
      updatedUrls.forEach((u, i) => {
        if (u === match[0]) {
          updatedUrls[i] = newUrl!;
        }
      });
    }
  }

  return { text: replacedText, urls: updatedUrls };
};
