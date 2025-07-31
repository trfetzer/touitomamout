import ora from "ora";

import { makeBlobFromFile } from "../../helpers/medias/__tests__/helpers/make-blob-from-file";
import { Media } from "../../types";
import { linkedinSenderService } from "../linkedin-sender.service";
import { mediaDownloaderService } from "../media-downloader.service";

vi.mock("../../constants", () => ({
  DEBUG: false,
  PUPPETEER_HEADLESS: "new",
}));
vi.mock("../media-downloader.service", () => ({
  mediaDownloaderService: vi.fn(),
}));
vi.mock("../linkedin-sender.service", async () => {
  const actual = await vi.importActual("../linkedin-sender.service");
  return { ...actual };
});
const mediaDownloaderServiceMock = mediaDownloaderService as vi.Mock;

const setInputFiles = vi.fn();
const type = vi.fn();
const click = vi.fn();
const waitForSelector = vi.fn();
const waitForNavigation = vi.fn();
const url = vi.fn().mockReturnValue("https://linkedin.com/posts/1");
const setCookie = vi.fn();
const goto = vi.fn();
const close = vi.fn();
const page = {
  setCookie,
  goto,
  waitForSelector,
  click,
  type,
  setInputFiles,
  waitForNavigation,
  url,
};
const newPage = vi.fn().mockResolvedValue(page);

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({ newPage, close }),
  },
}));

const sessionCookie = "cookie";
const tweetId = "123";
const text = "Post text";
const log = ora();

const media: Media = {
  type: "image",
  id: "id",
  url: "https://placehold.co/10x10.png",
  alt_text: "alt",
};

describe("linkedinSenderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send the post", async () => {
    await linkedinSenderService(sessionCookie, tweetId, text, [], log);

    expect(newPage).toHaveBeenCalled();
    expect(type).toHaveBeenCalledWith('div[role="textbox"]', text);
    expect(setInputFiles).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalled();
  });

  it("should send the post with media", async () => {
    const blob = await makeBlobFromFile("image-png.png", "image/png");
    mediaDownloaderServiceMock.mockResolvedValueOnce(blob);
    await linkedinSenderService(sessionCookie, tweetId, text, [media], log);

    expect(setInputFiles).toHaveBeenCalledTimes(1);
  });

  it("should skip when no content", async () => {
    await linkedinSenderService(sessionCookie, tweetId, "", [], log);

    expect(newPage).not.toHaveBeenCalled();
  });
});
