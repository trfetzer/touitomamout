# Importing Tool Usage

The project includes documentation for an `import-archives` script that rebuilds the cache from previous social-media exports. This documentation is located at `docs/docs/tools/import-archives.mdx`. It explains what the tool does and how to run it.

## Overview

The `import-archives` script helps rebuild a cache from earlier posts. It reads export files from Twitter, Mastodon and Bluesky and updates the Touitomamout cache accordingly.

## Usage

Run the script with `ts-node` and provide the paths to your archive files when prompted:

```bash
npx ts-node src/tools/import-archives.ts
```

The script will ask for the following locations:

- **tweets.js** and optional **note-tweet.js** from the Twitter archive
- **outbox.json** from the Mastodon export
- the folder that contains Bluesky post files

## Example

```text
Path to tweets.js: /exports/twitter/data/tweets.js
Path to note-tweet.js (optional, press enter to skip):
Path to Mastodon outbox.json: /exports/mastodon/outbox.json
Path to Bluesky export folder: /exports/bluesky/posts
```

After parsing the files, the cache is updated with the discovered posts.

## Steps to Use the Tool

1. Ensure Node.js and `ts-node` are available in your environment.
2. Run `npx ts-node src/tools/import-archives.ts`.
3. Provide the paths to the required export files when the script prompts you.
4. Once finished, the cache will contain data from your previous Twitter, Mastodon, and Bluesky posts.

Refer to the built-in documentation at `docs/docs/tools/import-archives.mdx` for more details.
