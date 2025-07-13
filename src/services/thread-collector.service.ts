import { Scraper, Tweet } from "@the-convocation/twitter-scraper";

import { TWITTER_HANDLE } from "../constants";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { isTweetCached } from "../helpers/tweet/is-tweet-cached";
import { tweetFormatter } from "../helpers/tweet/tweet-formatter";
import { readQueue, writeQueue, Queue } from "../helpers/queue";

const collectThread = async (
  twitterClient: Scraper,
  tweet: Tweet,
  cachedPosts: Awaited<ReturnType<typeof getCachedPosts>>,
  queuedIds: Set<string>,
): Promise<Tweet[]> => {
  const stack: Tweet[] = [];
  let current: Tweet | undefined = tweet;

  while (current) {
    stack.unshift(current);
    const parentId = current.inReplyToStatusId;
    if (!parentId) {
      break;
    }
    if (cachedPosts[parentId] || queuedIds.has(parentId)) {
      break;
    }
    try {
      const parentRaw = await twitterClient.getTweet(parentId);
      const parent = tweetFormatter(parentRaw as Tweet);
      if (parent.username !== TWITTER_HANDLE || parent.isRetweet) {
        break;
      }
      current = parent;
    } catch {
      break;
    }
  }
  return stack;
};

export const threadCollectorService = async (
  twitterClient: Scraper,
): Promise<Queue> => {
  const cachedPosts = await getCachedPosts();
  const queue = await readQueue();
  const queuedIds = new Set(queue.map((q) => q.id));

  const tweetsIterator = twitterClient.getTweets(TWITTER_HANDLE, 200);
  for await (const raw of tweetsIterator) {
    const formatted = tweetFormatter(raw as Tweet);
    if (isTweetCached(formatted, cachedPosts) || queuedIds.has(formatted.id)) {
      continue;
    }

    if (formatted.username !== TWITTER_HANDLE || formatted.isRetweet) {
      continue;
    }

    const thread = await collectThread(
      twitterClient,
      formatted,
      cachedPosts,
      queuedIds,
    );

    for (const t of thread) {
      if (queuedIds.has(t.id) || isTweetCached(t, cachedPosts)) {
        continue;
      }
      queue.push({
        id: t.id!,
        timestamp: t.timestamp ?? Date.now(),
        inReplyToStatusId: t.inReplyToStatusId,
      });
      queuedIds.add(t.id);
    }
  }

  queue.sort((a, b) => a.timestamp - b.timestamp);
  await writeQueue(queue);
  return queue;
};
