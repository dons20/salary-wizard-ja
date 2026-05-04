# Salary Wizard Jamaica

![Salary Wizard Jamaica preview](public/social-preview.webp)

Salary Wizard Jamaica is a salary planning app for people in Jamaica.

Its main purpose is to help users quickly understand what their pay means across different time periods and currencies, with an estimated self-employed tax view for Jamaica.

The app lets users:

- Enter pay in annual, monthly, weekly, daily, or hourly formats.
- Convert salary values across major currencies with live exchange rates.
- View salary breakdown rows and set per-row currency preferences.
- Estimate Jamaican self-employed tax from the calculated annual gross amount.
- Keep working with cached exchange rates when offline.

## Exchange rates via Cloudflare Worker + KV

The client now reads exchange rates from a Cloudflare Worker endpoint instead of calling the upstream provider directly.

### Worker behavior

- `GET /api/exchange-rates` returns the latest cached rates from Workers KV.
- A daily cron trigger refreshes the KV snapshot from Open Exchange Rates.
- If KV is empty, the first request bootstraps it by fetching upstream once.

### Required Cloudflare setup

1. Create a Workers KV namespace named for exchange rates.
2. Set the KV namespace IDs in `wrangler.jsonc`.
3. Add the `OPENEXCHANGE_APP_ID` secret with your Open Exchange Rates app id.
4. Optionally set `CORS_ORIGIN` if the Worker will be called from a different origin.

### Local development

1. Run `npm run worker:dev` to start the Worker locally on `http://localhost:8787`.
2. Run `npm run dev` for the Vite client.
3. If you serve the Worker from another URL, set `VITE_EXCHANGE_RATE_API_URL` in your Vite environment.

### Deploying the Worker

1. Fill in the KV namespace IDs in `wrangler.jsonc`.
2. Set `OPENEXCHANGE_APP_ID` with `npx wrangler secret put OPENEXCHANGE_APP_ID`.
3. Deploy with `npm run worker:deploy`.

In production, the client defaults to `/api/exchange-rates`. If your Worker is deployed on a separate hostname, set `VITE_EXCHANGE_RATE_API_URL` to that full Worker URL.
