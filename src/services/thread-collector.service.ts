import { Scraper, Tweet } from "@the-convocation/twitter-scraper";

import { START_TWEET_ID } from "../constants";

export interface QueueItem {
  id: string;
  parentId?: string;
}

export const readQueue = async (): Promise<QueueItem[]> => {
  return [];
};

/**
 * Collect tweets and their threads from the queue. Items with an id lower than
 * `START_TWEET_ID` are ignored.
 */
export const threadCollectorService = async (
  twitterClient: Scraper,
): Promise<Tweet[]> => {
  const queue = (await readQueue()).filter(
    (q) => BigInt(q.id) > START_TWEET_ID,
  );

  const collected: Tweet[] = [];

  for (const item of queue) {
    if (BigInt(item.id) <= START_TWEET_ID) {
      continue;
    }

    // Actual implementation would fetch tweets and their parents here. In tests
    // this behavior is mocked.
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const tweet = (await (twitterClient as any).getTweet?.(item.id)) as Tweet;
    if (tweet && BigInt(tweet.id) > START_TWEET_ID) {
      collected.push(tweet);
    }
  }

  return collected;
};
