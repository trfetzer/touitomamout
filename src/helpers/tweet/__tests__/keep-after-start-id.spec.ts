import { Tweet } from "@the-convocation/twitter-scraper";

import { keepAfterStartId } from "../keep-after-start-id";

vi.mock("../../../constants", () => ({
  START_TWEET_ID: BigInt(2),
}));

describe("keepAfterStartId", () => {
  it("should return false when tweet id is before START_TWEET_ID", () => {
    const result = keepAfterStartId({ id: "1" } as unknown as Tweet);
    expect(result).toBe(false);
  });

  it("should return true when tweet id is after START_TWEET_ID", () => {
    const result = keepAfterStartId({ id: "3" } as unknown as Tweet);
    expect(result).toBe(true);
  });

  it("should return true when tweet id equals START_TWEET_ID", () => {
    const result = keepAfterStartId({ id: "2" } as unknown as Tweet);
    expect(result).toBe(true);
  });
});
