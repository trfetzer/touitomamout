import { Scraper } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../../helpers/tweet";
let tweetsGetterService: typeof import("../tweets-getter.service").tweetsGetterService;
import { MockTwitterClient } from "./mocks/twitter-client";
import { makeTweetMock } from "./helpers/make-tweet-mock";

const mockedConstants = {
  TWITTER_HANDLE: "username",
  DEBUG: false,
  API_RATE_LIMIT: 10,
  START_TWEET_ID: BigInt(0),
};
vi.mock("../../constants", () => mockedConstants);
vi.mock("../../helpers/tweet/is-tweet-cached");

const isTweetCachedMock = isTweetCached as vi.Mock;

describe("tweetsGetterService", () => {
  beforeEach(() => {
    vi.resetModules();
    mockedConstants.START_TWEET_ID = BigInt(0);
  });
  describe("when tweets are not cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(false);
    });

    it("should be kept", async () => {
      const client = new MockTwitterClient(3);
      ({ tweetsGetterService } = await import("../tweets-getter.service"));
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(3);
    });
  });

  describe("when tweets are cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(true);
    });

    it("should be skipped", async () => {
      const client = new MockTwitterClient(3);
      ({ tweetsGetterService } = await import("../tweets-getter.service"));
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(0);
    });
  });

  describe("when encountering tweets before START_TWEET_ID", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(false);
      mockedConstants.START_TWEET_ID = BigInt(2);
    });

    it("should stop processing earlier tweets", async () => {
      const t3 = makeTweetMock({ id: "3" });
      const t2 = makeTweetMock({ id: "2" });
      const t1 = makeTweetMock({ id: "1" });
      const client = new MockTwitterClient(undefined, [t3, t2, t1]);
      ({ tweetsGetterService } = await import("../tweets-getter.service"));
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets.map((t) => t.id)).toEqual(["2", "3"]);
    });
  });
});
