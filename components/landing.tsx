'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Cpu, Hammer, Menu, MoveUpRight, Shapes, X } from 'lucide-react';
import AsciiSignal from './ascii-signal';
import WaitlistForm from './waitlist-form';

const DitherPanel = dynamic(() => import('./dither-panel'), {ssr:false, loading:()=> <div className="shader-static" />});

gsap.registerPlugin(useGSAP, ScrollTrigger);

const signals = ['MAKERS', 'TINKERERS', 'DESIGNERS', 'ENGINEERS', 'FOUNDERS', 'CURIOUS MINDS'];

function Badge({n,children}:{n:string;children:React.ReactNode}) {
  return <div className="section-index"><span className="section-index-sq">{n}</span><span>{children}</span></div>;
}

function PixelBot() {
  return <svg viewBox="0 0 240 240" role="img" aria-label="Pixel-style robot hand reaching toward a spark" className="pixel-art">
    <g fill="currentColor" shapeRendering="crispEdges">
      <path d="M92 76h56v10H92zM80 86h80v12H80zM68 98h104v48H68zM80 146h80v12H80zM96 158h48v12H96z"/>
      <path d="M50 110h18v24H50zM172 110h18v24h-18zM88 170h18v20H88zM134 170h18v20h-18z"/>
      <path d="M110 190h20v20h-20zM35 28h8v26h-8zM26 37h26v8H26zM192 44h6v22h-6zM184 52h22v6h-22z"/>
    </g>
    <g fill="#171914" shapeRendering="crispEdges"><path d="M86 111h20v19H86zM134 111h20v19h-20zM106 137h28v7h-28z"/></g>
    <g fill="#D9FF60" shapeRendering="crispEdges"><path d="M90 115h12v12H90zM138 115h12v12h-12z"/></g>
    <path d="M19 205h202M19 19v202M221 19v202M19 19h202" fill="none" stroke="currentColor" strokeWidth="2" opacity=".3" strokeDasharray="3 10"/>
  </svg>;
}

export default function Landing({waitlistReady}:{waitlistReady:boolean}) {
  const wrap = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    // Hold the hero target's centering in GSAP's transform so the cursor parallax is additive.
    gsap.set('.visual-target', { xPercent: -50, yPercent: -50 });
    // A tiny pixel scout rides reading progress down the right side with a gentle sway,
    // leaning into its drift and fading in/out at the extremes. Smooth, not a corner-to-corner ricochet.
    const scout = wrap.current?.querySelector<HTMLElement>('.scroll-scout');
    if (scout && wrap.current) {
      const xTo = gsap.quickTo(scout, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(scout, 'y', { duration: 0.5, ease: 'power3' });
      const rTo = gsap.quickTo(scout, 'rotation', { duration: 0.6, ease: 'power3' });
      const setO = gsap.quickSetter(scout, 'opacity');
      const place = (p: number) => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const small = vw <= 640;
        const size = small ? 19 : 30;
        const sway = Math.sin(p * Math.PI * 3);              // a few easy passes top -> bottom
        const lane = vw - (small ? 34 : 64) - size / 2;      // rest near the right edge
        xTo(lane + sway * (small ? 14 : 30));
        yTo(28 + p * (vh - 72));                             // travel the viewport as you scroll
        rTo(sway * 10);                                      // lean into the drift
        const fade = Math.min(p / 0.06, (1 - p) / 0.06, 1);  // ease in/out near the ends
        setO(Math.max(0, fade) * 0.85);
      };
      place(0);
      ScrollTrigger.create({
        trigger: wrap.current, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
        onUpdate: (self) => place(self.progress),
        onRefresh: (self) => place(self.progress),
      });
    }
    gsap.from('[data-intro]', {y:36, autoAlpha:0, duration:0.95, ease:'power3.out', stagger:0.095, delay:0.08});
    gsap.from('.hero-module', {x:54, autoAlpha:0, duration:1.1, ease:'power3.out', delay:0.35});
    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    items.forEach((el) => {
      gsap.from(el, {scrollTrigger:{trigger:el,start:'top 88%',once:true},y:48,autoAlpha:0,duration:0.85,ease:'power3.out'});
    });
  }, {scope:wrap});

  function mouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!visualRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = visualRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2))/rect.width;
    const dy = (e.clientY - (rect.top + rect.height/2))/rect.height;
    // Keep the -50%/-50% centering inside GSAP's transform (xPercent/yPercent) so the
    // parallax offset adds to it instead of replacing it and flinging the target off-center.
    gsap.to(visualRef.current.querySelector('.visual-target'), {xPercent:-50,yPercent:-50,x:dx*25,y:dy*25,duration:0.7,ease:'power3.out',overwrite:true});
  }
  function mouseLeave() {
    if (!visualRef.current) return;
    gsap.to(visualRef.current.querySelector('.visual-target'), {xPercent:-50,yPercent:-50,x:0,y:0,duration:0.7,ease:'power3.out',overwrite:true});
  }

  return <main ref={wrap} id="top">
    {/* Texture belongs above the visual layers, but is fully non-interactive. */}
    <div className="film-grain" aria-hidden="true" />
    {/* The scout follows reading progress, not a time-based infinite loop. */}
    <div className="scroll-scout" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none" shapeRendering="crispEdges">
        <path d="M14 3h8v4h-8zM10 7h16v4H10zM6 11h24v14H6zM10 25h16v4H10zM14 29h8v4h-8z" fill="#11130f" />
        <path d="M10 11h16v14H10z" fill="#d9ff60" />
        <path d="M12 14h4v5h-4zM20 14h4v5h-4zM14 22h8v2h-8z" fill="#11130f" />
        <path d="M1 16h5v5H1zM30 16h5v5h-5z" fill="#ff744b" />
      </svg>
    </div>
    <a href="#story" className="skip-link">Skip to content</a>
    <div className="status-strip"><span>AN OPEN INVITATION TO BENGALURU&apos;S BUILDERS</span><span><span className="status-dot"/> PROJECT STATUS: EARLY / V0.1</span></div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="MAKE-BLR home"><Image src="/logo-cream.png" alt="MAKE-BLR" width={500} height={500} className="brand-logo" priority /></a>
      <nav className={`nav-links ${mobileOpen ? 'nav-open':''}`} aria-label="Primary navigation">
        <a onClick={()=>setMobileOpen(false)} href="#story">THE PROBLEM</a>
        <a onClick={()=>setMobileOpen(false)} href="#idea">THE IDEA</a>
        <a onClick={()=>setMobileOpen(false)} href="#plan">THE PLAN</a>
        <a onClick={()=>setMobileOpen(false)} href="#vision">THE VISION</a>
      </nav>
      <a className="nav-cta" href="#join">GET EARLY ACCESS <ArrowUpRight size={16}/></a>
      <button className="menu-toggle" aria-label={mobileOpen?'Close menu':'Open menu'} aria-expanded={mobileOpen} onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X size={23}/>:<Menu size={23}/>}</button>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-main">
        <div className="hero-copy">
          <div className="eyebrow" data-intro><span className="eyebrow-spark">✳</span> THE CITY IS OUR WORKSHOP. <span className="eyebrow-muted">[ BLR / INDIA ]</span></div>
          <h1 id="hero-title" className="hero-title">
            <span data-intro>BUILD</span>
            <span data-intro>THINGS<span className="period">.</span></span>
            <span data-intro className="title-outline">FIND YOUR</span>
            <span data-intro className="hero-fluoro">PEOPLE<span className="blink-cursor">_</span></span>
          </h1>
          <div className="hero-bottom" data-intro>
            <p>A community in the making for Bengaluru&apos;s makers, tinkerers, engineers, designers, and founders.<br/><strong>Starting with people. Building the rest together.</strong></p>
            <a href="#join" className="button-primary">JOIN THE EARLY LIST <ArrowUpRight size={22}/></a>
          </div>
        </div>
        <div className="hero-module" ref={visualRef} onMouseMove={mouseMove} onMouseLeave={mouseLeave}>
          <div className="module-top"><span><span className="green-bullet"/> EXPERIMENT 001</span><span>[ MOVE YOUR CURSOR ]</span></div>
          <div className="hero-visual">
            <DitherPanel/>
            <div className="visual-grid"/>
            <div className="visual-target">
              <span className="target-circle outer"/><span className="target-circle inner"/><span className="target-cross">+</span>
            </div>
            <span className="plot-tag top">FIG.01 / FROM NOTHING</span><span className="plot-tag bottom">TO SOMETHING ↗</span>
          </div>
          <div className="module-controls"><span>MAKE SIGNAL / ONLINE</span><span>▓▓▓▓▓▓▓░░░&nbsp; 68%</span></div>
          <div className="module-caption">DESIGNED FOR THE CURIOUS.<br/>BUILT BY THE CURIOUS.</div>
        </div>
      </div>
      <div className="hero-tail"><a href="#story">SCROLL TO EXPLORE <ArrowDown size={17}/></a><span>[ MAKE-BLR.001 © 2026 ]</span></div>
    </section>

    <div className="signal-marquee" aria-label="Builders, makers, tinkerers, designers, engineers and curious minds"><div className="marquee-track">{[0,1,2].map(i=><span key={i}>{signals.map((s,j)=><span key={s+j}><span className="marquee-star">✳</span>{s}</span>)}</span>)}</div></div>

    <section id="story" className="story section-light">
      <div className="section-mast"><Badge n="01">THE PROBLEM</Badge><span>REALITY CHECK / BLR</span></div>
      <div className="story-grid">
        <h2 data-reveal>IDEAS ARE<br/>EVERYWHERE.<br/><span className="highlighter">ACCESS ISN&apos;T.</span></h2>
        <div className="story-aside" data-reveal><div className="decor-asterisk">✳</div><p>Having an idea isn&apos;t always the hard part. Finding the tools, space, know-how, and people to bring it to life? That&apos;s where things get stuck.</p><p className="story-note">Too many projects stay sketches. We think more of them deserve a shot.</p></div>
      </div>
      <div className="friction-grid">
        <div className="friction-card" data-reveal><span>01 / ACCESS</span><Box size={36} strokeWidth={1.2}/><h3>TOOLS</h3><p>Not everyone has a lab, workshop, or the equipment they need.</p></div>
        <div className="friction-card" data-reveal><span>02 / OPPORTUNITY</span><Hammer size={36} strokeWidth={1.2}/><h3>SPACE</h3><p>There aren&apos;t always easy places to try things, fail, and learn.</p></div>
        <div className="friction-card" data-reveal><span>03 / CONNECTION</span><Cpu size={36} strokeWidth={1.2}/><h3>PEOPLE</h3><p>Finding collaborators and practical guidance can be a project of its own.</p></div>
      </div>
    </section>

    <section id="idea" className="idea-section section-dark">
      <div className="section-mast"><Badge n="02">THE IDEA</Badge><span>NEW POSSIBILITIES / LOADING</span></div>
      <div className="idea-layout">
        <div className="idea-left" data-reveal>
          <div className="idea-kicker">OUR HYPOTHESIS_</div>
          <h2>WHAT IF<br/>WE BUILT<br/><em>A PLACE</em><br/>TO BUILD?</h2>
          <p>Not another group to collect contacts. A community where people learn, experiment, collaborate, and actually make things.</p>
          <a href="#plan" className="text-link">HERE&apos;S HOW WE START <ArrowUpRight size={21}/></a>
        </div>
        <div className="idea-right" data-reveal>
          <div className="idea-screen"><div className="idea-screen-bar"><span>TERMINAL / MAKE-BLR</span><span>▣ ▣ ▣</span></div><div className="ascii-container"><AsciiSignal/></div><div className="idea-terminal-lines"><div>&gt; CONNECTING CURIOUS MINDS...</div><div>&gt; TESTING WHAT WORKS...</div><div><span className="terminal-caret">_</span></div></div></div>
          <div className="idea-caption"><span>NOT A FINISHED SPACE.</span><span>AN OPEN QUESTION WORTH BUILDING.</span></div>
        </div>
      </div>
      <div className="idea-small-grid" data-reveal><div>FROM <span>CONVERSATION</span></div><ArrowRight/><div>TO <span>COLLABORATION</span></div><ArrowRight/><div>TO <span>CREATION</span></div></div>
    </section>

    <section id="plan" className="plan-section section-green">
      <div className="section-mast"><Badge n="03">OUR FIRST STEPS</Badge><span>SMALL, REAL, REPEATABLE.</span></div>
      <div className="plan-head" data-reveal><h2>START SMALL.<br/>BUILD FOR REAL<span className="plan-punctuation">.</span></h2><p>We&apos;re not launching a giant facility on day one. We&apos;re finding the people and testing what matters before scaling anything.</p></div>
      <div className="plan-steps">
        <article data-reveal><span className="step-num">/ 01</span><div className="step-graphic" aria-hidden="true"><span className="graphic-ears">◖ ◗</span></div><h3>LISTEN<span>↗</span></h3><p>Meet builders. Learn what they need. Separate exciting ideas from real demand.</p><div className="step-end">DISCOVER / VALIDATE</div></article>
        <article data-reveal><span className="step-num">/ 02</span><div className="step-graphic" aria-hidden="true"><span className="graphic-stars">✳<span>✳</span>✳</span></div><h3>GATHER<span>↗</span></h3><p>Try small meetups, workshops, and build sessions. Get people making things together.</p><div className="step-end">MEET / EXPERIMENT</div></article>
        <article data-reveal><span className="step-num">/ 03</span><div className="step-graphic" aria-hidden="true"><svg className="graphic-grow" viewBox="0 0 120 120" shapeRendering="crispEdges" fill="currentColor"><rect x="6" y="82" width="22" height="32"/><rect x="34" y="62" width="22" height="52"/><rect x="62" y="40" width="22" height="74"/><rect x="90" y="16" width="22" height="98"/></svg></div><h3>GROW<span>↗</span></h3><p>Let proven needs and real participation shape our next steps, tools, and spaces.</p><div className="step-end">PROVE / REINVEST</div></article>
      </div>
    </section>

    <section id="vision" className="vision-section section-light">
      <div className="section-mast"><Badge n="04">THE BIG PICTURE</Badge><span>LONG-TERM AMBITION / NO SHORTCUTS</span></div>
      <div className="vision-top" data-reveal>
        <span className="vision-side-label">[ MADE IN BENGALURU ]</span>
        <h2>ONE CITY.<br/><span>ENDLESS</span><br/>POSSIBILITIES<span className="period">.</span></h2>
      </div>
      <div className="vision-lower"><div className="vision-art" data-reveal><div className="vision-art-grid"/><div className="vision-art-inner"><PixelBot/></div><span className="vision-art-sticker">BUILT HERE ↗</span><span className="vision-art-code">MAKE/BLR//001</span></div><div className="vision-copy" data-reveal><Shapes size={34}/><p>Imagine a Bengaluru where anyone with an idea and the drive to build can find their people, learn useful skills, and access the resources to try.</p><p className="vision-small">That&apos;s the direction. We start locally, learn what works, and hope to help that spirit travel further someday.</p><div className="vision-rule"><span>BLR FIRST.</span><span>THEN WE&apos;LL SEE.</span><MoveUpRight size={20}/></div></div></div>
    </section>

    <section id="join" className="join-section section-dark">
      <div className="section-mast"><Badge n="05">YOUR MOVE</Badge><span>NO GATEKEEPING / JUST CURIOSITY</span></div>
      <div className="join-layout"><div className="join-copy" data-reveal><div className="join-eyebrow">THE FIRST STEP IS FINDING EACH OTHER.</div><h2>GOOD THINGS<br/>START WITH<br/><span>A FEW PEOPLE.</span></h2><p>It might be you. And a friend. And someone across the city working on something wildly different. Let&apos;s find out what we can make together.</p><div className="hand-note">you don&apos;t need a startup.<br/>you just need curiosity. ↗</div><div className="join-glyph">✳</div></div><div data-reveal><WaitlistForm ready={waitlistReady}/></div></div>
    </section>

    <footer className="footer" id="privacy">
      <div className="footer-main"><div className="footer-brand"><Image src="/logo-ink.png" alt="MAKE-BLR" width={500} height={500} className="footer-logo" /></div><a href="#top">BACK TO TOP ↑</a></div>
      <div className="footer-bottom"><div><strong>BUILT WITH CURIOSITY IN BENGALURU.</strong><br/>© 2026 MAKE-BLR. THIS IS ONLY THE BEGINNING.</div><div className="footer-privacy"><strong>A NOTE ON YOUR DATA.</strong><br/>We collect your email, interest, and optional idea to understand demand and send occasional project updates. We don&apos;t sell your details. To request deletion or stop messages, reply to any project email. A full privacy policy will be published before launch.</div><div>VERSION 0.1<br/>[ END OF TRANSMISSION ]</div></div>
    </footer>
  </main>;
}
