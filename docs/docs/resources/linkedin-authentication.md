---
title: LinkedIn authentication
---

# LinkedIn Authentication

Touitomamout uses a headless browser powered by **Puppeteer** to automate posting on LinkedIn. In order for the browser to act as an authenticated user it requires your LinkedIn session cookie (`li_at`).

## Retrieving the `li_at` cookie

1. Sign in to LinkedIn in your regular web browser.
2. Open the developer tools (usually `F12` or `Ctrl+Shift+I`).
3. Navigate to the **Application** tab then **Cookies** for `https://www.linkedin.com`.
4. Locate the cookie named `li_at` and copy its value.

Provide this value as the environment variable `LINKEDIN_SESSION_COOKIE` when running Touitomamout. On first use the cookie is saved to `linkedin.cookies.json` within your storage directory for later runs.

## Security considerations

The `li_at` cookie grants access to your LinkedIn account. Treat it like a password and do not share it. The saved `linkedin.cookies.json` file should be kept private and deleted if you no longer wish Touitomamout to access your account.
