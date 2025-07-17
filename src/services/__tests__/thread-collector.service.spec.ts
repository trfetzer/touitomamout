import { Scraper } from "@the-convocation/twitter-scraper";
import { promises as fs } from "fs";

import { MockTwitterClient } from "./mocks/twitter-client";
import { makeTweetMock } from "./helpers/make-tweet-mock";

let threadCollectorService: typeof import("../thread-collector.service").threadCollectorService;

const mockedConstants = {
  TWITTER_HANDLE: "username",
  QUEUE_PATH: "./queue.instance.json",
  START_TWEET_ID: BigInt(0),
};
vi.mock("../../constants", () => mockedConstants);
vi.mock("../../helpers/cache/get-cached-posts", () => ({
  getCachedPosts: vi.fn().mockResolvedValue({}),
}));

const queuePath = "./queue.instance.json";

describe("threadCollectorService", () => {
  beforeEach(async () => {
    await fs.rm(queuePath, { force: true });
    vi.resetModules();
  });

  it("should collect a full thread", async () => {
    mockedConstants.START_TWEET_ID = BigInt(0);
    ({ threadCollectorService } = await import("../thread-collector.service"));
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

    const client = new MockTwitterClient(
      1,
      [t3],
      { "2": t2, "1": t1 }
    ) as unknown as Scraper;

    const queue = await threadCollectorService(client);
    expect(queue.map((q) => q.id)).toEqual(["1", "2", "3"]);
  });

  it("should stop collecting when tweet id is before START_TWEET_ID", async () => {
    mockedConstants.START_TWEET_ID = BigInt(2);
    ({ threadCollectorService } = await import("../thread-collector.service"));

    const t3 = makeTweetMock({ id: "3", timestamp: 3 });
    const t2 = makeTweetMock({ id: "2", timestamp: 2 });
    const t1 = makeTweetMock({ id: "1", timestamp: 1 });

    const client = new MockTwitterClient(1, [t3, t2, t1]) as unknown as Scraper;

    const queue = await threadCollectorService(client);
    expect(queue.map((q) => q.id)).toEqual(["2", "3"]);
  });
});
