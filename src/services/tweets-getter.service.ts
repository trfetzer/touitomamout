import { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import ora from "ora";

import { API_RATE_LIMIT, TWITTER_HANDLE, START_TWEET_ID } from "../constants";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { savePostToCache } from "../helpers/cache/save-post-to-cache";
import { oraPrefixer, oraProgress } from "../helpers/logs";
import { isTweetCached, tweetFormatter } from "../helpers/tweet";
import { getEligibleTweet } from "../helpers/tweet/get-eligible-tweet";

const pullContentStats = (tweets: Tweet[], title: string) => {
  const stats = {
    total: tweets.length,
    retweets: tweets.filter((t) => t.isRetweet).length,
    replies: tweets.filter((t) => t.isReply).length,
    quotes: tweets.filter((t) => t.isQuoted).length,
  };

  return (
    `${title}:` +
    Object.entries(stats).reduce(
      (s, [name, value]) => `${s} ${name}: ${value}`,
      ""
    )
  );
};

export const tweetsGetterService = async (
  twitterClient: Scraper,
): Promise<Tweet[]> => {
  const cachedPosts = await getCachedPosts();
  const log = ora({
    color: "cyan",
    prefixText: oraPrefixer("content-mapper"),
  }).start();
  log.text = "filtering";

  let preventPostsSynchronization = false;
  const LATEST_TWEETS_COUNT = 5;

  /**
   * Optimization: Check a few of the latest tweets to see
   * if synchronization is needed at all.
   */
  const latestTweets = twitterClient.getTweets(
    TWITTER_HANDLE,
    LATEST_TWEETS_COUNT,
  );

  for await (const latestTweet of latestTweets) {
    log.text = "post: → checking for synchronization needs";
    if (!preventPostsSynchronization) {
      // Format the tweet
      const tweet = await getEligibleTweet(tweetFormatter(latestTweet));
      if (tweet) {
        // If the latest eligible tweet is already cached, no sync is needed
        if (isTweetCached(tweet, cachedPosts)) {
          preventPostsSynchronization = true;
        }
        // If it's not cached, we break and proceed with actual sync
        break;
      }
    }
  }

  // List to return
  const tweets: Tweet[] = [];

  if (preventPostsSynchronization) {
    log.succeed("task finished (unneeded sync)");
  } else {
    const tweetsIds = twitterClient.getTweets(TWITTER_HANDLE, 200);

    let hasRateLimitReached = false;
    let tweetIndex = 0;
    for await (const tweet of tweetsIds) {
      tweetIndex++;
      oraProgress(log, { before: "post: → filtering" }, tweetIndex, 200);

      // Detect a timeout for rate-limiting
      const rateLimitTimeout = setTimeout(
        () => (hasRateLimitReached = true),
        1000 * API_RATE_LIMIT,
      );

      // If we’ve been rate-limited or tweet is cached, skip quickly
      if (hasRateLimitReached || isTweetCached(tweet, cachedPosts)) {
        clearTimeout(rateLimitTimeout);
        continue;
      }

      // ================================
      // NEW: Exclude tweets older than
      // START_TWEET_ID and mark them
      // as cached to avoid re-checking
      // ================================
      if (START_TWEET_ID) {
        const numericTweetId = Number(tweet.id_str || tweet.id);
        const numericStartId = Number(START_TWEET_ID);
        if (numericTweetId <= numericStartId) {
          // Mark it in the cache so we don’t re-check next run
          savePostToCache({
            ...tweetFormatter(tweet),
            excludedByStartId: true, // optional property
          });
          clearTimeout(rateLimitTimeout);
          continue; // skip processing this tweet
        }
      }

      // Format & check if tweet is otherwise eligible
      const formattedTweet: Tweet = tweetFormatter(tweet);
      const eligibleTweet = await getEligibleTweet(formattedTweet);
      if (eligibleTweet) {
        // Insert at front so that the newest tweets end up last in the array
        tweets.unshift(eligibleTweet);
      }
      clearTimeout(rateLimitTimeout);
    }

    if (hasRateLimitReached) {
      log.warn(
        `rate limit reached, more than ${API_RATE_LIMIT}s to fetch a single tweet`,
      );
    }

    log.succeed(pullContentStats(tweets, "tweets"));
    log.succeed("task finished");
  }

  return tweets;
};
