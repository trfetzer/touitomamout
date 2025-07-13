import { Platform } from "../../../types";
import { replaceSyncedPostLinks } from "../replace-synced-post-links";

vi.mock("../../cache/get-cached-posts", () => ({
  getCachedPosts: vi.fn(),
}));

vi.mock("../../../constants", () => ({
  MASTODON_INSTANCE: "mastodon.social",
}));

const getCachedPostsMock = (await import("../../cache/get-cached-posts")).getCachedPosts as vi.Mock;

describe("replaceSyncedPostLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should leave links unchanged when no cache entry exists", async () => {
    getCachedPostsMock.mockResolvedValue({});

    const text = "Check https://twitter.com/user/status/1";
    const urls = ["https://twitter.com/user/status/1"];
    const result = await replaceSyncedPostLinks(text, urls, Platform.MASTODON, "mastouser");

    expect(result).toEqual({ text, urls });
  });

  it("should replace links for Mastodon", async () => {
    getCachedPostsMock.mockResolvedValue({
      "1": { [Platform.MASTODON]: ["999"] },
    });

    const text = "Check https://x.com/user/status/1";
    const urls = ["https://x.com/user/status/1"];
    const result = await replaceSyncedPostLinks(text, urls, Platform.MASTODON, "alice");

    expect(result).toEqual({
      text: "Check https://mastodon.social/@alice/999",
      urls: ["https://mastodon.social/@alice/999"],
    });
  });

  it("should replace links for Bluesky", async () => {
    getCachedPostsMock.mockResolvedValue({
      "2": { [Platform.BLUESKY]: [{ cid: "cid", rkey: "rkey" }] },
    });

    const text = "See https://twitter.com/user/status/2";
    const urls = ["https://twitter.com/user/status/2"];
    const result = await replaceSyncedPostLinks(text, urls, Platform.BLUESKY, "bob.bsky.social");

    expect(result).toEqual({
      text: "See https://bsky.app/profile/bob.bsky.social/post/rkey",
      urls: ["https://bsky.app/profile/bob.bsky.social/post/rkey"],
    });
  });
});
