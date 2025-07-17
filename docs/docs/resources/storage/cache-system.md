---
title: Storage system
---

# Cache system
To resume the sync process where it stopped, Touitomamout keeps track of the already synced tweets. This is done by storing the tweet's id in a file.
A cache file is named `cache.<twitter-username>.json` and stored in `STORAGE_DIR` (defaults to the project root).

## Cache file location
The cache file lives in `STORAGE_DIR`. If this variable is not set, it defaults to the project root.

## Cache file format
Version **0.2** introduces a structured cache with four top-level fields.
```json
{
  "version": "0.2",
  "instance": { "id": "<twitter-username>" },
  "profile": {
    "avatar": "<avatar>",
    "banner": "<banner>"
  },
  "posts": {
    "<tweet-id>": {
      "mastodon": ["<mastodon-post-id>"],
      "bluesky": [
        { "cid": "<bluesky-post-cid>", "rkey": "<bluesky-post-rkey>" }
      ]
    }
  }
}
```
