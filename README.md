# Client Reporter

An [n8n](https://n8n.io) automation that emails clients an automatic **monthly site report** —
real health & performance data gathered by the bot (no client logins required), written up in
plain English by an LLM.

**Status: ✅ Complete & live** — running locally in n8n (Docker), monthly report for example-client.com.

## What it reports (per site)
- **PageSpeed / Lighthouse** scores: performance, SEO, accessibility, best-practices
- Core Web Vitals: LCP, CLS, total blocking time
- Uptime + SSL certificate status

## Status (built phase by phase)
- [x] **Phase 1** — Workflow gathers self-measured site metrics (uptime, load time, SSL, size, SEO basics)
- [x] **Phase 2** — LLM (Claude, Gemini fallback) turns metrics into a plain-English client report
- [x] **Phase 3** — Emails the report to each client (per-site recipient); formatted + monthly schedule. Verified.
- [x] **Phase 4** — Multi-client (SITES + RECIPIENTS), monthly schedule, formatted emails
- [x] **Phase 5** — Docs + tests (6/6) + finalized

## Run n8n locally
```bash
docker run -d --restart unless-stopped --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Karachi" -e TZ="Asia/Karachi" \
  -e NODE_FUNCTION_ALLOW_BUILTIN="tls,https,http,dns,url" \
  -e N8N_BLOCK_ENV_ACCESS_IN_NODE="false" \
  -e GEMINI_API_KEY="your_free_gemini_key" \
  -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

## Repo layout
- `workflows/` — exported, **sanitized** n8n workflow JSON (no credentials).
- `docs/` — architecture and notes.

## Data sources
- [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) — free, URL-only (no client auth). An optional API key raises the quota.
- Uptime/SSL — checked directly (read-only).
- (Later) Google Analytics / Search Console — needs each client's OAuth grant.

## Add a client
Two small edits in the n8n workflow "Client Reporter":
1. **Gather metrics** node → add the domain to `SITES`:
   ```js
   const SITES = ['example-client.com', 'newclient.com'];
   ```
2. **Write report** node → add their email to `RECIPIENTS` (defaults to you for review):
   ```js
   const RECIPIENTS = { 'example-client.com': 'owner@example-client.com', 'newclient.com': 'them@newclient.com' };
   ```
Each site is gathered, written up, and emailed independently.

## Security / privacy
- Read-only checks; gentle on the sites. No client logins or credentials required.
- LLM/SMTP keys live only in the n8n container env, never in the committed workflow JSON.
- Exported workflow JSON is sanitized (SMTP credential replaced with a placeholder).

## Enable PageSpeed / Lighthouse scores (optional)
The report adds real performance/SEO/accessibility scores when a key is present:
1. In Google Cloud, create a free API key with the **PageSpeed Insights API** enabled.
2. Add it to the n8n container env: `-e PAGESPEED_API_KEY=your_key` (recreate the container).
3. Reports then include mobile Lighthouse scores + Core Web Vitals (LCP, CLS, TBT).

Without a key it's skipped cleanly — the rest of the report is unaffected.
