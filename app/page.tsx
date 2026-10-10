import Landing from '@/components/landing';

// Enable the public form only after its backend, CAPTCHA, and receipt are configured.
export default function Home() {
  const waitlistReady = process.env.WAITLIST_ENABLED === 'true' && Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL &&
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
  return <Landing waitlistReady={waitlistReady}/>;
}
