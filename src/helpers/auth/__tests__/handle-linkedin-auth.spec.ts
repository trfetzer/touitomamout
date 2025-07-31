import { beforeEach, vi } from "vitest";

import { handleLinkedinAuth } from "../handle-linkedin-auth";
import { saveLinkedinCookies } from "../save-linkedin-cookies";

vi.mock("../save-linkedin-cookies", () => ({
  saveLinkedinCookies: vi.fn(),
}));

const { mockedConstants } = vi.hoisted(() => ({
  mockedConstants: {
    LINKEDIN_SESSION_COOKIE: "",
    PUPPETEER_HEADLESS: "new",
  },
}));

vi.mock("../../../constants", () => mockedConstants);
vi.doMock("../../../constants", () => ({
  LINKEDIN_SESSION_COOKIE: mockedConstants.LINKEDIN_SESSION_COOKIE,
  PUPPETEER_HEADLESS: mockedConstants.PUPPETEER_HEADLESS,
}));

const cookies = vi.fn().mockResolvedValue([]);
const setCookie = vi.fn();
const goto = vi.fn();
const newPage = vi.fn().mockResolvedValue({ cookies, setCookie, goto });
const close = vi.fn();

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({ newPage, close }),
  },
}));

const saveLinkedinCookiesMock = saveLinkedinCookies as unknown as vi.Mock;

describe("handleLinkedinAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no session cookie", () => {
    beforeEach(() => {
      mockedConstants.LINKEDIN_SESSION_COOKIE = "";
    });

    it("should not init puppeteer", async () => {
      await handleLinkedinAuth();

      expect(newPage).not.toHaveBeenCalled();
      expect(saveLinkedinCookiesMock).not.toHaveBeenCalled();
    });
  });

  describe("when session cookie is provided", () => {
    beforeEach(() => {
      mockedConstants.LINKEDIN_SESSION_COOKIE = "cookie";
    });

    it("should save cookies", async () => {
      await handleLinkedinAuth();

      expect(newPage).toHaveBeenCalled();
      expect(setCookie).toHaveBeenCalledWith({
        name: "li_at",
        value: "cookie",
        domain: ".linkedin.com",
        path: "/",
      });
      expect(goto).toHaveBeenCalledWith("https://www.linkedin.com/feed/");
      expect(saveLinkedinCookiesMock).toHaveBeenCalledWith([]);
      expect(close).toHaveBeenCalled();
    });
  });
});
