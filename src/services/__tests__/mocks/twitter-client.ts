import { Tweet } from "@the-convocation/twitter-scraper";

import { makeTweetMock } from "../helpers/make-tweet-mock";

export class MockTwitterClient {
  constructor(
    tweetCount?: number,
    tweets?: Tweet[],
    fetchMap: Record<string, Tweet> = {},
  ) {
    this.tweetCount = tweetCount || tweets?.length || 200;
    this.tweets = tweets;
    this.fetchMap = fetchMap;
  }

  private readonly tweetCount: number;
  private readonly tweets?: Tweet[];
  private readonly fetchMap: Record<string, Tweet>;

  public async *getTweets(
    user: string,
    maxTweets?: number,
  ): AsyncGenerator<Tweet> {
    if (this.tweets) {
      for (const t of this.tweets) {
        yield { ...t, username: user } as Tweet;
      }
      return;
    }
    for (let i = 0; i < (this.tweetCount ?? maxTweets); i++) {
      yield {
        ...makeTweetMock({ username: user }),
        id: i.toString(),
      } as Tweet;
    }
  }

  public async getTweet(id: string): Promise<Tweet> {
    return this.fetchMap[id];
  }
}
