import { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import { vi } from "vitest";

import * as ThreadCollector from "../thread-collector.service";
import { threadCollectorService } from "../thread-collector.service";

vi.mock("../../constants", () => ({
  START_TWEET_ID: 5n,
}));

describe("threadCollectorService", () => {
  it("should ignore tweets with id below the threshold", async () => {
    const readQueueSpy = vi
      .spyOn(ThreadCollector, "readQueue")
      .mockResolvedValue([
        { id: "1" },
        { id: "6" },
      ]);

    const getTweet = vi
      .fn()
      .mockImplementation(async (id: string): Promise<Tweet> => ({
        id,
        conversationId: undefined,
        hashtags: [],
        html: id,
        inReplyToStatus: undefined,
        inReplyToStatusId: undefined,
        isQuoted: false,
        isReply: false,
        isRetweet: false,
        permanentUrl: undefined,
        photos: [],
        quotedStatus: undefined,
        quotedStatusId: undefined,
        text: id,
        timestamp: Date.now(),
        urls: [],
        userId: "user",
        username: "user",
        sensitiveContent: undefined,
        likes: undefined,
        isPin: undefined,
        isSelfThread: undefined,
        mentions: [],
        name: undefined,
        place: undefined,
        thread: [],
        timeParsed: undefined,
        replies: 0,
        retweets: 0,
        retweetedStatus: undefined,
        retweetedStatusId: undefined,
        videos: [],
        views: undefined,
      }));
    const twitterClient = { getTweet } as unknown as Scraper;

    const tweets = await threadCollectorService(twitterClient);
    expect(readQueueSpy).toHaveBeenCalled();
    expect(getTweet).toHaveBeenCalledTimes(1);
    expect(tweets.map((t) => t.id)).toEqual(["6"]);
  });
});
