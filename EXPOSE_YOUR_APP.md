# Expose Your App Service (Local → Public)

When developing ONES Apps (or any webhook-based integration), you often need a **public HTTPS URL** that forwards traffic to a service running on your laptop (for example `http://localhost:3000`).

This guide lists common, developer-friendly ways to expose a local service to the public internet, with copy/paste commands and practical caveats.

---

## When to use what

### Quick demos / temporary testing (minutes)

- **Cloudflare Tunnel (quick tunnel)**: fast, no account required, good for ad-hoc sharing.
- **ngrok**: very popular, polished UX, stable-ish URLs depending on plan.
- **Tailscale Funnel**: great if you already use Tailscale; secure by default, public URL via your node.

### More stable / production-like testing (hours–days)

- **Cloudflare Tunnel (named tunnel)**: more stable, supports custom domains, better for repeated testing.
- **Your existing tunnel solution**: if your team already uses a tunnel tool/provider, reuse it to stay consistent.

---

## Security checklist (do this before sharing)

- **Assume it is public**: anything you expose will be scanned and probed.
- **Add authentication**: even basic auth or a shared secret header is better than nothing.
- **Prefer HTTPS**: many platforms (including webhook providers) require HTTPS endpoints.
- **Limit scope**: expose only the specific route(s) you need (or add an allowlist).
- **Avoid leaking secrets**: never log access tokens, cookies, or full request bodies in public demos.

---

## Option A: Cloudflare Tunnel (cloudflared)

### A1) Quick tunnel (no account)

This is the fastest way to get a public URL.

```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflare will print a `https://<random>.trycloudflare.com` URL in the output. This is ideal for temporary testing, but **it has no uptime guarantee** and the URL changes between runs.

**Notes**

- You may see a warning about missing `config.yml` — that’s expected for quick tunnels.
- If your service only listens on `127.0.0.1`, that’s fine; `cloudflared` runs locally and can reach it.

### A2) Named tunnel (recommended for repeated use)

Use this when you want a more stable setup (custom domain, better control).

High-level flow:

1. Install `cloudflared`
2. Authenticate
3. Create a named tunnel
4. Route DNS to the tunnel
5. Run with a config file

Docs: `https://developers.cloudflare.com/cloudflare-one/connections/connect-apps`

---

## Option B: ngrok

If you want an easy, well-supported tool with great docs/UI, use ngrok.

```bash
ngrok http 3000
```

ngrok will display a public forwarding URL (usually HTTPS). For longer-lived or custom subdomain URLs you’ll typically need an account and an auth token.

Docs: `https://ngrok.com/docs`

---

## Option C: Tailscale Funnel

If you already have Tailscale installed and connected, Funnel can publish a local service to the public internet under a `*.ts.net` hostname.

### C1) Publish a local HTTP service

```bash
tailscale funnel localhost:3000
```

It will print the “Available on the internet” URL.

### C2) Check status / reset

```bash
tailscale funnel status
tailscale funnel reset
```

Docs: `https://tailscale.com/kb/1311/tailscale-funnel`

**Notes**

- Funnel’s HTTPS listener ports are restricted (commonly `443`, `8443`, `10000`). See the docs for details.
- For reverse proxy targets, Tailscale currently supports proxying to `http://127.0.0.1` (your local service can still bind to localhost).

---

## Option D: Use your preferred tunnel tool (recommended if you already have one)

If you already have a tunnel approach you trust (company standard, personal preference, existing account), use it. The key requirements for webhook/callback testing are:

- You get a **public HTTPS URL**
- It forwards to your local service (for example `http://127.0.0.1:3000`)
- You can keep it running long enough for your testing window

### D1) Minimal checklist

No matter which tool you choose, make sure you:

- **Protect the endpoint** (shared secret header, basic auth, IP allowlist, etc.)
- **Only expose what you need** (specific route/path if possible)
- **Turn it off when done**

### D2) Examples of “bring your own tunnel”

You can use any tool that provides an HTTPS public URL to your local port, for example:

- Cloudflare Tunnel (quick or named) — see Option A
- ngrok — see Option B
- Tailscale Funnel — see Option C

If your setup uses a VPS, reverse proxy (Caddy/Nginx), or SSH port forwarding, that can also work — but keep it simple unless you truly need full control.

---

## Troubleshooting

### “It works locally but not via the public URL”

- Confirm your app listens on the correct interface/port (try `curl http://127.0.0.1:3000`).
- Check if your app enforces host checks / CSRF / origin checks that reject the tunnel host.
- If your app is HTTP-only but you test HTTPS, ensure the tunnel terminates TLS and forwards HTTP correctly.

### “Webhooks time out”

- Reduce cold start time / add a quick 200 response.
- Ensure your local dev server is running and not sleeping.
- Check that your tunnel process is still running.

---

## Recommended defaults for ONES App development

- **Fastest**: Cloudflare quick tunnel (`cloudflared tunnel --url http://localhost:<port>`)
- **More stable**: Named Cloudflare tunnel (custom domain) or ngrok paid plan
- **If you already use Tailscale**: Tailscale Funnel

