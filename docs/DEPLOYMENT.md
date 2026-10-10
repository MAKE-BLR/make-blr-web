# MAKE-BLR / Deployment handbook (V1.1)

**Code status:** Source implementation, not a verified production deployment. Run local build/tests, then deploy to a preview URL before attaching your public domain. Keep the waitlist disabled until the backend checklist is complete.

## Hosting decision

- **Netlify (suggested for first public deployment):** works with Next.js App Router and `app/api/waitlist/route.ts` through its OpenNext adapter. Has a free commercial-use tier subject to usage limits. See https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/ and https://www.netlify.com/blog/introducing-netlify-free-plan/ .
- **Vercel:** simplest native Next.js integration. **Commercial projects should not use Vercel Hobby**; their Hobby terms restrict personal/non-commercial use. Use an appropriate paid plan if launching this as a venture. See https://vercel.com/legal/terms .
- **GitHub Pages:** hosts static exports only. The animated homepage itself works, but **not our current POST route** (`/api/waitlist`) or its server secrets. To use Pages, extract the backend to an independent service (e.g., Supabase Edge Function or Cloudflare Worker) and replace `fetch('/api/waitlist')` with a secured call to that service. Do not add `output: 'export'` without this backend change; the current API route will prevent it from building. https://nextjs.org/docs/app/guides/static-exports

## A. Deploy with Netlify (recommended first)

1. Extract this project and open a terminal in `make-blr-v1`.
2. Install Node 22 or newer, then run `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run dev`. Fix any errors first.
3. Create a **private** GitHub repository for MAKE-BLR. Add all project files **except** `.env.local`; `.gitignore` already excludes it. Commit and push to `main`.
4. Sign in at https://app.netlify.com/ and select **Add new project → Import an existing project → GitHub**. Authorize the repository.
5. Netlify should detect Next.js automatically. Keep the build command as `npm run build` and use Netlify's framework-managed output; do not configure `out/` or an SPA catch-all redirect. Deploy to the preview hostname.
6. In **Project configuration → Environment variables**, enter the values listed in `.env.example` (see waitlist sequence below). For now set `WAITLIST_ENABLED=false`. Redeploy after changing environment variables.
7. Test the public preview (including mobile performance, GSAP effects, no WebGL support fallback, reduced-motion preference, form disabled state, console warnings).
8. Add `make-blr.com` under **Domain management → Add a domain**. Copy the exact DNS instructions that Netlify shows to your registrar's DNS panel. Configure `www` alias/redirect as desired and wait for TLS/HTTPS to be issued.
9. After all waitlist checks pass, set `WAITLIST_ENABLED=true`, redeploy, then submit real end-to-end signups.

## B. Deploy with Vercel (alternative)

1. Push the source to a private GitHub repo (never commit `.env.local`).
2. In https://vercel.com/new import that repo; select an account/plan appropriate for this project (commercial work cannot use Hobby under current terms).
3. Let Vercel auto-detect Next.js. Set environment variables in **Project → Settings → Environment Variables**, initially `WAITLIST_ENABLED=false`.
4. Deploy and check the provided preview URL. In Project → Settings → Domains add `make-blr.com`. Follow the exact DNS records provided by Vercel (do not guess values); verify HTTPS.
5. Set up storage/email/CAPTCHA as below, redeploy, and test before announcing the public URL.

## C. GitHub Pages — **static** route only (requires refactor)

1. Remove or relocate `app/api/waitlist/route.ts`, including its private Supabase/Resend logic, to a separate serverless backend. This must authenticate/verify Turnstile **server-side**, validate requests, store rows, and send emails. Never expose a service-role/secret database key or Resend key in the browser or GitHub Actions build artifact.
2. Change form submission from `fetch('/api/waitlist')` to a public backend URL; apply origin/CORS controls, rate limiting, anti-abuse protections, and input validation there. Keep the waitlist disabled until this endpoint is live.
3. Update `next.config.ts` to include `output: 'export'`; when hosting on `username.github.io/repository`, also add `basePath: '/repository'`. If serving `make-blr.com` from the root, no basePath is required. Consider `images: { unoptimized: true }` if using Next.js Image.
4. `npm run build` outputs the static `out/` folder. Add `public/.nojekyll` so `_next` assets are served by Pages. Configure GitHub Actions to build and deploy `out/`, or upload its contents using an appropriate Pages workflow.
5. In GitHub → Settings → Pages, select GitHub Actions, add and verify `make-blr.com` as a custom domain, configure the registrar DNS per GitHub's instructions, and enable **Enforce HTTPS** after it provisions.
6. Test from a clean browser. A static export does not host your waitlist API or emails; this is a hard architectural requirement, not a simple Next.js setting.

## Waitlist + email: actual end-to-end sequence

1. **Database:** Create a Supabase project. Open its SQL editor and run `supabase/schema.sql`. Confirm the `waitlist` table and unique email constraint exist and RLS is enabled.
2. **Backend credentials:** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-side-only variables. The older service-role key works with the current code. Supabase now recommends newer server-only secret keys; if migrating, test SDK compatibility and update the env documentation. **Never prefix secrets with `NEXT_PUBLIC_`.**
3. **Email sender:** At https://resend.com/domains verify your real sender domain via the DNS records Resend issues. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` using a valid sender domain; provide a **real monitored mailbox** for replies/removal requests. A verified sending domain alone does not create a receiving mailbox.
4. **CAPTCHA:** Create a Cloudflare Turnstile widget that permits the staging and production hostnames. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public) and `TURNSTILE_SECRET_KEY` (secret). The API verifies captcha results against Cloudflare for every real submission.
5. **Site URL:** Set `NEXT_PUBLIC_SITE_URL=https://make-blr.com` when the custom domain is operational, or the preview origin in staging. Keep `WAITLIST_ENABLED=false` until checks finish.
6. **Legal/operations:** Publish a working privacy notice, describe how signup information is stored and used, define retention rules, and implement a reliable opt-out/deletion process (initial manual process is in `WAITLIST_OPERATIONS.md`). Set up mail inbox monitoring and review database access policies.
7. **Enable:** Set `WAITLIST_ENABLED=true` **only after** all items above are configured; redeploy because the homepage readiness flag is evaluated server-side.
8. **End-to-end smoke test:** Submit an unused test address and verify (a) browser success, (b) one database row in Supabase, (c) accepted email in Resend logs, (d) receipt at the inbox, and (e) reply goes to a human-monitored mailbox. Test a duplicate signup, expired Turnstile token, and invalid email. Ensure no secrets appear in browser developer tools or the Git repo.
9. **Ongoing:** Track email failures and manually resend those marked `failed` after diagnosis; evaluate a proper retry queue if the list grows. Confirmation email accepted by provider **does not guarantee inbox delivery**. Do not promise a launched physical makerspace or concrete event dates.

### Site flow diagram

```text
Visitor → HTTPS frontend (Netlify / Vercel)
        → POST /api/waitlist (server-side validation + Turnstile)
        → Supabase: save interested builder and consent
        → Resend: send one welcome / acknowledgement message
        → Visitor: on-screen confirmation
                  + inbox acknowledgement (if delivered)
```

### Security notes

- Keep Git repository private during preparation. Use host environment settings for secrets.
- Add rate limiting / additional abuse monitoring before a significant public campaign. CAPTCHA is not a complete abuse solution.
- A welcome email is not a subscription management system. Before sending recurring bulk updates, implement unsubscribe handling and suppression lists.
- Check each provider's current terms, free limits, and commercial-use rules before a public launch.
