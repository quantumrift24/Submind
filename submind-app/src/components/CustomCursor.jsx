import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  // Don't render the custom cursor on touch devices
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (isTouchDevice) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    const cursor = cursorRef.current;
    const ring = ringRef.current;

    let animId;

    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      
      if (cursor && ring) {
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove);
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Set up hover states on all interactive elements via high-performance event delegation
  useEffect(() => {
    if (isTouchDevice) return;
    const handleMouseOver = (e) => {
      const cursor = cursorRef.current;
      const ring = ringRef.current;
      if (!cursor || !ring) return;

      const target = e.target.closest('button, a, input, select, textarea, .dot, .feat-card, .sidebar-link, .card, [role="button"]');
      if (target) {
        cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
        ring.style.opacity = '0.8';
      }
    };

    const handleMouseOut = (e) => {
      const cursor = cursorRef.current;
      const ring = ringRef.current;
      if (!cursor || !ring) return;

      const target = e.target.closest('button, a, input, select, textarea, .dot, .feat-card, .sidebar-link, .card, [role="button"]');
      if (target) {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.opacity = '0.5';
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={cursorRef}
        id="cursor"
        style={{
          position: 'fixed', width: 14, height: 14, borderRadius: '50%', background: 'var(--lime)',
          pointerEvents: 'none', zIndex: 9999, transform: 'translate(-50%,-50%)',
          transition: 'transform 0.08s, width 0.2s, height 0.2s, opacity 0.2s', mixBlendMode: 'difference'
        }}
      />
      <div
        ref={ringRef}
        id="cursor-ring"
        style={{
          position: 'fixed', width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--lime)',
          pointerEvents: 'none', zIndex: 9998, transform: 'translate(-50%,-50%)',
          transition: 'transform 0.18s ease, width 0.25s, height 0.25s, opacity 0.3s', opacity: 0.5
        }}
      />
    </>
  );
}
