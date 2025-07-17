import { Tweet } from "@the-convocation/twitter-scraper";

import { START_TWEET_ID } from "../../constants";

export const keepAfterStartId = (tweet: Tweet) => {
  if (!tweet.id) {
    return false;
  }
  try {
    return BigInt(tweet.id) >= START_TWEET_ID;
  } catch {
    return false;
  }
};
