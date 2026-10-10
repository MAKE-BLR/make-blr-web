'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ArrowUpRight, Check, LoaderCircle, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: { render: (target: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string; reset: (widgetId: string) => void };
  }
}
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export default function WaitlistForm({ready}:{ready:boolean}) {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('meet');
  const [idea, setIdea] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [token, setToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(0);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string|null>(null);

  // Capture the client mount time for bot timing. This page is statically prerendered,
  // so the value must come from the browser on mount, not from render (which runs at build).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setStartedAt(Date.now()); }, []);
  useEffect(() => {
    if (!siteKey || !turnstileReady || !window.turnstile || !turnstileRef.current || widgetRef.current) return;
    widgetRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: setToken,
      'expired-callback': () => setToken(''),
      'error-callback': () => setToken(''),
    });
  }, [turnstileReady]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending'); setMessage('');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email,interest,idea,website,updatesConsent:consent,startedAt,token}),
      });
      const body: {ok?:boolean;message?:string;confirmation?:string} = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.message || 'Something went wrong.');
      setConfirmation(body.confirmation || ''); setStatus('success');
    } catch (err) {
      setStatus('error'); setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      if (siteKey && widgetRef.current && window.turnstile) { window.turnstile.reset(widgetRef.current); setToken(''); }
    }
  }

  return (
    <div className="form-shell">
      <div className="form-topline"><span>EARLY SIGNAL / 001</span><span><span className="live-dot"/> {ready ? "INTAKE OPEN" : "PREPARING INTAKE"}</span></div>
      {status === 'success' ? (
        <div className="form-success" role="status">
          <div className="success-mark"><Check size={38}/></div>
          <h3>YOU&rsquo;RE<br/>ON THE LIST.</h3>
          <p>Your interest has been recorded. We’re starting small, and you’ll help us figure out what should come next.</p>
          {confirmation === 'sent' ? <small>A confirmation email has been sent. Check your inbox.</small> : <small>We haven&rsquo;t confirmed an email delivery yet. Keep an eye out for future updates.</small>}
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate={false}>
          <div className="form-header">
            <span className="mini-cross" aria-hidden>✳</span>
            <h3>BE PART<br/>OF DAY ZERO.</h3>
            <p>Get early updates. Tell us what you want to build. Help shape a community from the ground up.</p>
          </div>
          <label className="field-label" htmlFor="waitlist-email">01 / YOUR EMAIL *</label>
          <input id="waitlist-email" className="field-input" autoComplete="email" name="email" type="email" required maxLength={254} placeholder="builder@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <label className="field-label" htmlFor="waitlist-interest">02 / WHAT WOULD HELP YOU BUILD? *</label>
          <select id="waitlist-interest" className="field-input field-select" name="interest" value={interest} onChange={e=>setInterest(e.target.value)}>
            <option value="meet">Meeting other builders</option>
            <option value="workshops">Workshops and build sessions</option>
            <option value="tools">Tools and shared workspace</option>
            <option value="help">Helping create MAKE-BLR</option>
          </select>
          <label className="field-label" htmlFor="waitlist-idea">03 / WHAT DO YOU WANT TO MAKE? <span>(OPTIONAL)</span></label>
          <textarea id="waitlist-idea" className="field-input field-textarea" rows={2} name="idea" maxLength={600} placeholder="Robots, art, weird machines, the next big thing..." value={idea} onChange={e=>setIdea(e.target.value)}/>
          <div className="honeypot" aria-hidden="true"><label htmlFor="site-url">Leave this empty</label><input id="site-url" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></div>
          <label className="consent-label"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/><span>I agree to receive occasional MAKE-BLR updates. I can ask to be removed at any time. <a href="#privacy">How my data is used ↗</a></span></label>
          {siteKey ? <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={()=>setTurnstileReady(true)}/><div ref={turnstileRef} className="turnstile-box"/></> : null}
          <button type="submit" className="cta-submit" disabled={!ready || status==='sending' || !consent || (Boolean(siteKey) && !token)}>
            <span>{!ready ? 'SIGNUPS OPENING SOON' : status==='sending' ? 'TRANSMITTING...' : 'JOIN THE EARLY LIST'}</span>{status==='sending' ? <LoaderCircle size={19} className="spin"/> : <ArrowUpRight size={24}/>}
          </button>
          {!ready ? <p className="form-pending">We&apos;re setting up the signup and confirmation systems. The form will open when they&apos;re connected.</p> : null}
          {status==='error' ? <p role="alert" className="form-error"><RefreshCw size={15}/>{message}</p> : null}
          <p className="form-footnote">NO FEE. NO SPAM. NO FACILITY PROMISES. JUST THE BEGINNING.</p>
        </form>
      )}
      <div className="form-bottomline"><span>MAKE-BLR / BENGALURU</span><span>[ TRANSMISSION READY ]</span></div>
    </div>
  );
}
