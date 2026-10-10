'use client';

import { useEffect, useState } from 'react';
import { Dithering } from '@paper-design/shaders-react';

export default function DitherPanel() {
  const [active, setActive] = useState(false);
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!mq.matches);
    update(); mq.addEventListener('change', update);
    // Defer the WebGL shader until after client mount (one-time gate, not a render loop).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true);
    return () => mq.removeEventListener('change', update);
  }, []);
  return (
    <div className="shader-stage" aria-hidden="true">
      {active ? <Dithering width="100%" height="100%" colorBack="#141712" colorFront="#d9ff60" shape="sphere" type="4x4" size={3} speed={motion ? 0.24 : 0} scale={0.86} /> : <div className="shader-static" />}
    </div>
  );
}
