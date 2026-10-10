import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import { welcomeEmail } from '@/lib/waitlist-email';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.email().trim().max(254),
  interest: z.enum(['meet', 'workshops', 'tools', 'help']),
  idea: z.string().trim().max(600).optional().default(''),
  updatesConsent: z.literal(true),
  website: z.string().max(200).optional().default(''),
  startedAt: z.number().int().positive(),
  token: z.string().max(4000).optional(),
});

const genericResult = { ok: true, message: 'If this is a new email, your interest has been saved.' };

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, message: 'Invalid origin.' }, { status: 403 });
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 12_000) return NextResponse.json({ ok: false, message: 'Payload too large.' }, { status: 413 });

  let input: z.infer<typeof schema>;
  try {
    const payload: unknown = await request.json();
    input = schema.parse(payload);
  } catch {
    return NextResponse.json({ ok: false, message: 'Please check your form and try again.' }, { status: 400 });
  }

  // Quietly ignore automated honeypot / unrealistic rapid form submissions.
  if (input.website || Date.now() - input.startedAt < 1200 || Date.now() - input.startedAt > 86_400_000) {
    return NextResponse.json(genericResult);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const emailReady = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  const captchaReady = !!(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && turnstileSecret);
  if (process.env.WAITLIST_ENABLED !== 'true' || !url || !key || !captchaReady || !emailReady) {
    return NextResponse.json({ ok: false, message: 'The waitlist is being prepared. Please check back soon.' }, { status: 503 });
  }

  if (turnstileSecret) {
    if (!input.token) return NextResponse.json({ ok: false, message: 'Please finish the security check.' }, { status: 400 });
    try {
      const form = new URLSearchParams({ secret: turnstileSecret, response: input.token });
      const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: form, cache:'no-store', signal: AbortSignal.timeout(4500),
      });
      const result: { success?: boolean; hostname?: string } = await verify.json();
      if (!result.success || (result.hostname && result.hostname !== new URL(request.url).hostname)) {
        return NextResponse.json({ ok: false, message: 'Security check failed. Please try again.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false, message: 'Security check unavailable. Please try again.' }, { status: 503 });
    }
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = input.email.toLowerCase();
  const resendConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  const { error } = await supabase.from('waitlist').insert({
    email, interest: input.interest, idea: input.idea || null,
    updates_consent: true, consent_at: new Date().toISOString(),
    confirmation_email_status: resendConfigured ? 'pending' : 'disabled',
  });

  if (error) {
    // Do not disclose whether someone is already signed up.
    if (error.code === '23505') return NextResponse.json(genericResult);
    console.error('Waitlist database insert failed:', error.code);
    return NextResponse.json({ ok: false, message: 'Could not save your interest right now. Please try again.' }, { status: 503 });
  }

  let confirmation = 'not_configured';
  if (resendConfigured) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const payload = welcomeEmail();
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!, to: [email], subject: payload.subject,
        html: payload.html, text: payload.text,
      });
      confirmation = emailError ? 'failed' : 'sent';
      if (emailError) console.error('Waitlist email failed:', emailError.name);
    } catch (e) {
      confirmation = 'failed';
      console.error('Waitlist email request failed:', e instanceof Error ? e.name : 'unknown');
    }
    await supabase.from('waitlist').update({ confirmation_email_status: confirmation }).eq('email', email);
  }
  return NextResponse.json({ ok: true, message: 'Your interest has been saved.', confirmation });
}
