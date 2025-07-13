import { AtpAgent } from "@atproto/api";
import * as Counter from "@pm2/io/build/main/utils/metrics/counter";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { blueskySenderService } from "../bluesky-sender.service";
import { mastodonSenderService } from "../mastodon-sender.service";
import { postsSynchronizerService } from "../posts-synchronizer.service";
import { threadCollectorService } from "../thread-collector.service";
import { MockTwitterClient } from "./mocks/twitter-client";

vi.mock("../../constants", () => ({
  TWITTER_HANDLE: "username",
  DEBUG: false,
  API_RATE_LIMIT: 1,
  SYNC_DRY_RUN: false,
  START_TWEET_ID: 0n,
}));

vi.mock("../../helpers/cache/get-cached-posts", () => {
  return {
    getCachedPosts: vi.fn().mockResolvedValue({
      "1234567891234567891": {},
      "1234567891234567892": {},
      "1234567891234567893": {},
    }),
  };
});

vi.mock("../../helpers/post/make-post", () => ({
  makePost: vi.fn().mockImplementation((tweet) => ({
    mastodon: {
      tweet,
      chunks: [tweet.text],
      username: "username",
    },
    bluesky: {
      tweet,
      chunks: [tweet.text],
      username: "username",
    },
  })),
}));

vi.mock("../bluesky-sender.service", () => ({
  blueskySenderService: vi.fn(),
}));
vi.mock("../mastodon-sender.service", () => ({
  mastodonSenderService: vi.fn(),
}));
vi.mock("../thread-collector.service", () => ({
  threadCollectorService: vi.fn(),
}));

const mastodonSenderServiceMock = (
  mastodonSenderService as vi.Mock
).mockImplementation(() => Promise.resolve());
const blueskySenderServiceMock = (
  blueskySenderService as vi.Mock
).mockImplementation(() => Promise.resolve());
const threadCollectorServiceMock = threadCollectorService as vi.Mock;

describe("postsSynchronizerService", () => {
  it("should return a response with the expected shape", async () => {
    const twitterClient = new MockTwitterClient(3) as unknown as Scraper;
    const mastodonClient = {} as mastodon.rest.Client;
    const blueskyClient = {} as AtpAgent;
    const synchronizedPostsCountThisRun = {
      inc: vi.fn(),
    } as unknown as Counter.default;

    const response = await postsSynchronizerService(
      twitterClient,
      mastodonClient,
      blueskyClient,
      synchronizedPostsCountThisRun,
    );

    expect(mastodonSenderServiceMock).toHaveBeenCalledTimes(3);
    expect(blueskySenderServiceMock).toHaveBeenCalledTimes(3);
    expect(response).toStrictEqual({
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: 3,
        justSynced: 3,
      },
    });
  });

  it("should skip queue items below the threshold", async () => {
    threadCollectorServiceMock.mockResolvedValue([
      { id: "1", photos: [], videos: [] },
      { id: "10", photos: [], videos: [] },
    ]);
    const twitterClient = {} as unknown as Scraper;
    const mastodonClient = {} as mastodon.rest.Client;
    const blueskyClient = {} as AtpAgent;
    const synchronizedPostsCountThisRun = { inc: vi.fn() } as unknown as Counter.default;

    const response = await postsSynchronizerService(
      twitterClient,
      mastodonClient,
      blueskyClient,
      synchronizedPostsCountThisRun,
    );

    expect(mastodonSenderServiceMock).toHaveBeenCalledTimes(1);
    expect(blueskySenderServiceMock).toHaveBeenCalledTimes(1);
    expect(response.metrics.justSynced).toBe(1);
  });
});
