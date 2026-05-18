import { useState, useEffect, useRef } from 'react';

export default function CountUp({ end, duration = 1500, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);
  
  // Use a ref to track the last value so we can animate from it
  const currentValRef = useRef(0);
  const targetVal = Number(end) || 0;

  useEffect(() => {
    startTime.current = performance.now();
    const startVal = currentValRef.current;
    const diff = targetVal - startVal;

    if (diff === 0) {
      setValue(targetVal);
      return;
    }

    function tick(now) {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * ease);
      setValue(current);
      currentValRef.current = current;

      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [targetVal, duration]);

  return (
    <span>
      {prefix}{value.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
