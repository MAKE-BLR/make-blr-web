# MAKE—BLR / Website V1

**Build things. Find your people.**  
Brutalist, animated, single-page launch website for an early-stage Bengaluru maker community.

> **Status:** Initial implementation, **not live** and **not yet runtime-tested**. External package installation was unavailable in the authoring environment. Run the checks below locally before deploying. No signup can be accepted until the infrastructure is configured.

## What's included

- Six-part visitor story: hook → problem → idea → realistic plan → long-term vision → early-list CTA
- Dark industrial design with a high-contrast lime/orange palette, oversized type, pixel illustrations, responsive layout
- GSAP scroll-triggered entrances, a pixel scout that follows full-page scroll progress, and interactive hero target (with reduced-motion handling)
- Subtle, page-wide animated SVG film grain (CSS, no external texture request)
- Paper Design **Dithering** canvas shader in the hero (loaded client-side)
- `react-ascii-text` terminal animation in the idea section
- Waitlist form with email, interest category, optional project idea, and explicit update consent
- Supabase persistence, unique email guard, optional idea capture, Cloudflare Turnstile, honeypot, and welcome email via Resend
- Graceful prelaunch state: public form **cannot accept signups** until all infrastructure is configured **and the launch switch is enabled**

## Hosting decisions

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for step-by-step instructions for Netlify, Vercel, and what must change for GitHub Pages. **Current code cannot be deployed directly to GitHub Pages with a working waitlist API**, since `/api/waitlist` requires a server.

For an early-stage, potentially commercial MAKE-BLR project, **Netlify Free is the initial budget-friendly hosting recommendation** (subject to limits). Vercel Pro is also well-suited, but Vercel Hobby terms restrict use to personal/non-commercial projects.

## Run locally

Requires Node.js 20.9+ (Node 22+ recommended) and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
# Open http://localhost:3000
```

## Turn the waitlist on

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
2. Add `SUPABASE_URL` and the **service-role** key to `.env.local`. Never use or expose the service-role key in the browser or `NEXT_PUBLIC_*` variables.
3. Verify a sender domain at Resend. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. For instance, **only if the actual mailbox/domain is operational**, `MAKE-BLR <hello@make-blr.com>`.
4. Add a Cloudflare Turnstile widget for your domain. Configure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; include `localhost` in your development configuration if needed.
5. Set `NEXT_PUBLIC_SITE_URL` to your deployment URL.
6. Complete the safety, privacy, and mailbox checks below, then set `WAITLIST_ENABLED=true` in the server environment and redeploy. The form activates only when all six provider settings **and** this explicit switch are present.
7. Submit a real test signup. Check the Supabase row and Resend delivery logs before announcing the URL.

**Backend behavior:**

- Saves data only with opt-in consent, uses server-side validation, Turnstile, and a hidden honeypot.
- If a signup address already exists, returns a non-identifying response and does **not** send a second email.
- Sends an acknowledgment after first successful insert. Delivery status is recorded as `pending`, `sent`, or `failed`; a provider-accepted send is not a guarantee of inbox delivery.
- A Resend failure does not erase the saved signup. Review `failed` statuses and retry manually after investigating.
- Keys are never bundled client-side. RLS enabled and anonymous table access revoked.

**Recommended before public launch:** provide a real monitored reply-to mailbox, publish a proper privacy notice and a working data-deletion / unsubscribe method, implement a resend job for failed confirmations, and confirm Cloudflare Turnstile works on the production hostname. The included footer is explanatory **draft copy**, not legal advice or a completed legal policy. Also configure managed database backups and a basic analytics dashboard.

## Check before shipping

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Test on Safari, Chromium, Firefox, and a slower Android phone. Confirm touch interaction, CTA anchoring, reduced-motion behavior, WebGL absence, and keyboard navigation. For slower devices, consider gating the dither shader behind a user-initiated interaction.

## Structure

```text
app/
  api/waitlist/route.ts    Secure email capture + notification
  page.tsx                 Waitlist readiness gate
  layout.tsx               SEO metadata
  globals.css              Design system / responsive styles
components/
  landing.tsx              All narrative sections and GSAP animation
  dither-panel.tsx         Paper dithering shader
  ascii-signal.tsx         Animated ASCII component
  waitlist-form.tsx        Form UI and confirmation state
lib/waitlist-email.ts      Reply template (text + HTML)
supabase/schema.sql        Database setup
```

## Design principle

Don't imply that a makerspace, equipment roster, program lineup, or active membership already exists. The first real offering is connection, listening, and small practical experiments. Revise the story after the mission statement and community research are validated.
