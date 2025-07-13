import { AtpAgent } from "@atproto/api";
import * as Counter from "@pm2/io/build/main/utils/metrics/counter";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { blueskySenderService } from "../bluesky-sender.service";
import { mastodonSenderService } from "../mastodon-sender.service";
import { postsSynchronizerService } from "../posts-synchronizer.service";
import { MockTwitterClient } from "./mocks/twitter-client";
import { makeTweetMock } from "./helpers/make-tweet-mock";

vi.mock("../thread-collector.service", () => ({
  threadCollectorService: vi.fn(),
}));
vi.mock("../../helpers/queue", () => ({
  writeQueue: vi.fn(),
}));

import { threadCollectorService } from "../thread-collector.service";
import { writeQueue } from "../../helpers/queue";

const threadCollectorServiceMock = threadCollectorService as vi.Mock;
const writeQueueMock = writeQueue as vi.Mock;

vi.mock("../../constants", () => ({
  TWITTER_HANDLE: "username",
  DEBUG: false,
  API_RATE_LIMIT: 1,
  SYNC_DRY_RUN: false,
}));

vi.mock("../../helpers/cache/get-cached-posts", () => {
  return {
    getCachedPosts: vi.fn().mockResolvedValue({}),
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

const mastodonSenderServiceMock = (
  mastodonSenderService as vi.Mock
).mockImplementation(() => Promise.resolve());
const blueskySenderServiceMock = (
  blueskySenderService as vi.Mock
).mockImplementation(() => Promise.resolve());


describe("postsSynchronizerService", () => {
  it("should process the queue sequentially", async () => {
    const t1 = makeTweetMock({ id: "1", timestamp: 1 });
    const t2 = makeTweetMock({
      id: "2",
      timestamp: 2,
      inReplyToStatusId: "1",
      inReplyToStatus: t1,
    });
    const t3 = makeTweetMock({
      id: "3",
      timestamp: 3,
      inReplyToStatusId: "2",
      inReplyToStatus: t2,
    });

    const queue = [
      { id: "1", timestamp: 1 },
      { id: "2", timestamp: 2, inReplyToStatusId: "1" },
      { id: "3", timestamp: 3, inReplyToStatusId: "2" },
    ];

    threadCollectorServiceMock.mockResolvedValue(queue);

    const twitterClient = new MockTwitterClient(undefined, undefined, {
      "1": t1,
      "2": t2,
      "3": t3,
    }) as unknown as Scraper;
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
    expect(writeQueueMock).toHaveBeenCalledWith([]);
    expect(response).toStrictEqual({
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: 0,
        justSynced: 3,
      },
    });
  });

  it("should keep reply chain across runs", async () => {
    const t1 = makeTweetMock({ id: "10", timestamp: 1 });
    const t2 = makeTweetMock({
      id: "11",
      timestamp: 2,
      inReplyToStatusId: "10",
      inReplyToStatus: t1,
    });

    threadCollectorServiceMock.mockReset();
    threadCollectorServiceMock
      .mockResolvedValueOnce([{ id: "10", timestamp: 1 }])
      .mockResolvedValueOnce([
        { id: "11", timestamp: 2, inReplyToStatusId: "10" },
      ]);

    const twitterClient = new MockTwitterClient(undefined, undefined, {
      "10": t1,
      "11": t2,
    }) as unknown as Scraper;
    const mastodonClient = {} as mastodon.rest.Client;
    const blueskyClient = {} as AtpAgent;
    const synchronizedPostsCountThisRun = {
      inc: vi.fn(),
    } as unknown as Counter.default;

    await postsSynchronizerService(
      twitterClient,
      mastodonClient,
      blueskyClient,
      synchronizedPostsCountThisRun,
    );

    writeQueueMock.mockClear();
    const getCachedPostsMock = (
      await import("../../helpers/cache/get-cached-posts")
    ).getCachedPosts as vi.Mock;
    getCachedPostsMock.mockResolvedValueOnce({ "10": {} });

    const response = await postsSynchronizerService(
      twitterClient,
      mastodonClient,
      blueskyClient,
      synchronizedPostsCountThisRun,
    );

    expect(threadCollectorServiceMock).toHaveBeenCalledTimes(2);
    expect(writeQueueMock).toHaveBeenCalledWith([]);
    expect(response.metrics.justSynced).toBe(1);
  });
});
