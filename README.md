> [!warning]
> 
> **The Touitomamout project is now archived.**
>
> I consider Twitter/X as a danger for our democracies. Its owner's posts, the encouraged & promoted content are, in my opinion, not compatible with my values of sharing, tolerance and humanism. Thus, I do not want to support this platform nor encourage people to use it, here as a source of content.
>
> Therefore, no future update will be published.
>
> - 🐳 **Docker** images stay available both on docker hub & github packages.
> - 📋 **Repository** stays online here, on github, in read-only.
> - 🤝 **Thanks** for your understanding.

# [touitomamout](https://github.com/louisgrasset/touitomamout)
[<img src="https://github.com/louisgrasset/touitomamout/raw/main/.github/docs/touitomamout.svg"  width="150px"/>](https://louisgrasset.github.io/touitomamout/docs/discover)

An easy way to synchronize your Twitter's tweets to Mastodon & Bluesky posts. 🦤 → 🦣+☁️.

When a tweet links to another tweet already synchronized by Touitomamout, that link is automatically rewritten to the Mastodon or Bluesky URL of the cross‑posted content.

[![Release](https://img.shields.io/github/package-json/v/louisgrasset/touitomamout/main?label=release&color=#4c1)](https://github.com/louisgrasset/touitomamout/releases)
[![License](https://img.shields.io/github/license/louisgrasset/touitomamout?color=#4c1)](https://github.com/louisgrasset/touitomamout/blob/main/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/louisgrasset/touitomamout)](https://github.com/louisgrasset/touitomamout/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/louisgrasset/touitomamout)](https://github.com/louisgrasset/touitomamout/issues)
[![Github Stars](https://img.shields.io/github/stars/louisgrasset/touitomamout?color=ffe34e)](https://github.com/louisgrasset/touitomamout)
[![Docker Pulls](https://img.shields.io/docker/pulls/louisgrasset/touitomamout?color=086dd7)](https://hub.docker.com/r/louisgrasset/touitomamout)
[![Docker Hub](https://img.shields.io/static/v1.svg?color=086dd7&labelColor=555555&logoColor=ffffff&label=&message=docker%20hub&logo=Docker)](https://hub.docker.com/r/louisgrasset/touitomamout)

Pipelines:

[![CI](https://img.shields.io/github/actions/workflow/status/louisgrasset/touitomamout/ci.yml?label=ci)](https://github.com/louisgrasset/touitomamout/actions/workflows/ci.yml)
[![CD](https://img.shields.io/github/actions/workflow/status/louisgrasset/touitomamout/cd.yml?label=cd)](https://github.com/louisgrasset/touitomamout/actions/workflows/cd.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/louisgrasset/touitomamout/codeql.yml?label=codeql)](https://github.com/louisgrasset/touitomamout/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/louisgrasset/touitomamout/release.yml?label=release)](https://github.com/louisgrasset/touitomamout/actions/workflows/release.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=louisgrasset_touitomamout&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=louisgrasset_touitomamout)

Tools:

[![Eslint](https://img.shields.io/badge/eslint-3A33D1?logo=eslint&logoColor=white)](https://github.com/eslint/eslint)
[![Prettier](https://img.shields.io/badge/prettier-1A2C34?logo=prettier&logoColor=white)](https://github.com/prettier/prettier)
![Sonarlint](https://img.shields.io/badge/sonarlint-CB2029?logo=sonarlint&logoColor=white)

## Linting and Formatting
Run `npm run lint` to check the code for lint errors. Use `npm run lint:fix` to automatically fix them.

![touitomamout banner](./.github/docs/touitomamout-banner.jpg)

## Documentation
You'll find everything you need from the project's discovery to its deployment, by the way of its configuration and some technical deep dives.

Please find the project documentation here:

[<img src="https://github.com/louisgrasset/touitomamout/raw/main/.github/docs/documentation-center.svg"  width="300px"/>](https://louisgrasset.github.io/touitomamout/docs/discover)

## Requirements
Touitomamout supports Node.js versions **18** and newer as defined in `package.json`.
For the best experience, we recommend using **Node.js 20**.
Running on more recent Node releases may still work but can produce warnings,
for instance with `assert { type: "json" }`.

## Dependencies
Kudos to the following projects that made Touitomamout project possible 🙏
- 🦤 [twitter-scraper](https://github.com/the-convocation/twitter-scraper)
- 🦣 [masto.js](https://github.com/neet/masto.js)
- ☁️ [atproto](https://github.com/bluesky-social/atproto)

## Running tests
Install dependencies before executing the test suite:

```bash
npm ci # or `npm install`
```

Run the tests with:

```bash
npm test
```

