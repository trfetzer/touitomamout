import { AtpAgent } from "@atproto/api";
import * as Counter from "@pm2/io/build/main/utils/metrics/counter";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";
import ora from "ora";

import { SYNC_DRY_RUN } from "../constants";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { oraPrefixer } from "../helpers/logs";
import { makePost } from "../helpers/post/make-post";
import { writeQueue } from "../helpers/queue";
import { Media, Metrics, SynchronizerResponse } from "../types";
import { blueskySenderService } from "./bluesky-sender.service";
import { mastodonSenderService } from "./mastodon-sender.service";
import { threadCollectorService } from "./thread-collector.service";
import { tweetFormatter } from "../helpers/tweet/tweet-formatter";

/**
 * An async method in charge of dispatching posts synchronization tasks for each received tweets.
 */
export const postsSynchronizerService = async (
  twitterClient: Scraper,
  mastodonClient: mastodon.rest.Client | null,
  blueskyClient: AtpAgent | null,
  synchronizedPostsCountThisRun: Counter.default,
): Promise<SynchronizerResponse & { metrics: Metrics }> => {
  const queue = await threadCollectorService(twitterClient);
  const tweets = [...queue];

  try {
    let tweetIndex = 0;
    let justSynced = 0;
    while (queue.length) {
      const item = queue[0];
      const fetchedTweet = await twitterClient.getTweet(item.id);
      if (!fetchedTweet) {
        queue.shift();
        await writeQueue(queue);
        continue;
      }
      const tweet = tweetFormatter(fetchedTweet);
      tweetIndex++;
      const log = ora({
        color: "cyan",
        prefixText: oraPrefixer("content-sync"),
      }).start();

      const medias = [
        ...tweet.photos.map((i) => ({ ...i, type: "image" })),
        ...tweet.videos.map((i) => ({ ...i, type: "video" })),
      ] as Media[];

      const { mastodon: mastodonPost, bluesky: blueskyPost } = await makePost(
        tweet,
        mastodonClient,
        blueskyClient,
        log,
        { current: tweetIndex, total: tweets.length },
      );

      if (!SYNC_DRY_RUN) {
        await mastodonSenderService(mastodonClient, mastodonPost, medias, log);
        await blueskySenderService(blueskyClient, blueskyPost, medias, log);
      }
      if (mastodonClient || blueskyPost) {
        synchronizedPostsCountThisRun.inc();
      }

      // remove processed tweet from queue
      queue.shift();
      await writeQueue(queue);
      justSynced++;

      log.stop();
    }

    return {
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: Object.keys(await getCachedPosts()).length,
        justSynced: justSynced,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: Object.keys(await getCachedPosts()).length,
        justSynced: 0,
      },
    };
  }
};
