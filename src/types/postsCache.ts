import { Platform } from "./platform";

export type MastodonCacheChunk = string;
export type BlueskyCacheChunk = {
  cid: string;
  rkey: string;
};
export type LinkedInCacheChunk = string;

export type MastodonCache = MastodonCacheChunk[];
export type BlueskyCache = BlueskyCacheChunk[];
export type LinkedInCache = LinkedInCacheChunk[];

export type PostsCache = Record<
  string,
  {
    [Platform.MASTODON]?: MastodonCache;
    [Platform.BLUESKY]?: BlueskyCache;
    [Platform.LINKEDIN]?: LinkedInCache;
  }
>;
export type ProfileCache = {
  avatar: string;
  banner: string;
};

export type InstanceCache = {
  id: string;
};

export type Cache = {
  version: string;
  instance: InstanceCache;
  profile: ProfileCache;
  posts: PostsCache;
};
