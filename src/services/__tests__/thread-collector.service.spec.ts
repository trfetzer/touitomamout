import { Scraper } from "@the-convocation/twitter-scraper";
import { promises as fs } from "fs";

import { threadCollectorService } from "../thread-collector.service";
import { MockTwitterClient } from "./mocks/twitter-client";
import { makeTweetMock } from "./helpers/make-tweet-mock";

vi.mock("../../constants", () => ({
  TWITTER_HANDLE: "username",
  QUEUE_PATH: "./queue.instance.json",
}));
vi.mock("../../helpers/cache/get-cached-posts", () => ({
  getCachedPosts: vi.fn().mockResolvedValue({}),
}));

const queuePath = "./queue.instance.json";

describe("threadCollectorService", () => {
  beforeEach(async () => {
    await fs.rm(queuePath, { force: true });
  });

  it("should collect a full thread", async () => {
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
});
