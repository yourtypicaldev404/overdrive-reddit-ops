# Overdrive Reddit Ops

A tiny approval inbox for Overdrive — Drive & Explore.

## What works immediately
Without Reddit API credentials, clicking the main button:
1. copies the suggested reply
2. opens the Reddit thread
3. leaves the final Reddit submit action to you

## Direct one-click posting
The app also includes full Reddit OAuth + comment submission code.
Set:
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_REDIRECT_URI`

Then connect your Reddit account from the dashboard.

**Policy note:** Overdrive promotion is a commercial use case. Reddit's current Developer/Data API terms say commercial API use needs Reddit approval / a separate agreement. Do not enable direct API posting until you have the required permission.

## Approval-link format
You can load a lead directly into the dashboard:

`/?url=<reddit-url>&title=<title>&subreddit=<subreddit>&reason=<reason>&draft=<draft>`

This is designed so a monitoring system can send you one approval link per opportunity.

## Local
```bash
npm install
npm run dev
```
