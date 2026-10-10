'use client';

import { useEffect, useState } from 'react';
import { useAsciiText, alligator } from 'react-ascii-text';

export default function AsciiSignal() {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPaused(mq.matches);
    update(); mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const asciiRef = useAsciiText({
    font: alligator,
    text: ['IDEA', 'MAKE', 'REPEAT'],
    animationCharacters: '░▒▓█',
    animationDelay: 1800,
    animationInterval: 800,
    animationSpeed: 38,
    animationLoop: true,
    isPaused: paused,
  });
  return <pre className="ascii-signal" ref={asciiRef} aria-hidden="true">IDEA / MAKE / REPEAT</pre>;
}
