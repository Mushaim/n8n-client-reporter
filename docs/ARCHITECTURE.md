# Architecture

```
[Schedule ▸ monthly, 1st @ 09:00]
      │
[Gather metrics]  (Code node)
   for each site: fetch homepage (status, load time, size, HTML),
   SSL days-to-expiry, robots.txt + sitemap presence,
   SEO basics from HTML (title, meta description, H1 count, viewport)
      │
[Write report]  (Code node)
   for each site: build a prompt from the metrics → LLM writes a
   150–200 word plain-English report (Claude, Gemini fallback);
   attach subject, an at-a-glance footer, and the client's email
      │
[Email report]  (SMTP)
   one email per site, sent to that site's recipient
```

## Data sources (no client credentials needed)
- Homepage fetch — status, response time, byte size, HTML.
- SSL certificate — days to expiry (TLS).
- robots.txt / sitemap.xml — presence check.
- SEO basics — title, meta description, H1 count, mobile viewport.
- PageSpeed Insights (Lighthouse: performance/SEO/accessibility + Core Web Vitals) — optional, needs a free API key
- (Later) Google Analytics / Google Analytics / Search Console — needs an API key or the client's OAuth.

## LLM
Claude via the Anthropic API (reliable, ~a cent per report), with Gemini as a free fallback.
Keys are read from the n8n container env (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) — never in the workflow JSON.
