import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const blobX = useMotionValue(-100);
  const blobY = useMotionValue(-100);

  const springX = useSpring(blobX, { stiffness: 80, damping: 20 });
  const springY = useSpring(blobY, { stiffness: 80, damping: 20 });

  const dotRef = useRef(null);
  const blobRef = useRef(null);
  const prevPos = useRef({ x: -100, y: -100 });
  const velRef = useRef(0);
  const rafRef = useRef(null);
  const magnetTarget = useRef(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let rawX = -100, rawY = -100;

    const move = (e) => {
      const dx = e.clientX - prevPos.current.x;
      const dy = e.clientY - prevPos.current.y;
      velRef.current = Math.sqrt(dx * dx + dy * dy);
      prevPos.current = { x: e.clientX, y: e.clientY };
      rawX = e.clientX;
      rawY = e.clientY;

      /* Magnetic pull toward interactive elements */
      if (magnetTarget.current) {
        const rect = magnetTarget.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
        const pull = Math.min(1, Math.max(0, 1 - dist / 80));
        rawX = e.clientX + (cx - e.clientX) * pull * 0.38;
        rawY = e.clientY + (cy - e.clientY) * pull * 0.38;
      }

      cursorX.set(rawX);
      cursorY.set(rawY);
      blobX.set(rawX);
      blobY.set(rawY);
    };

    const handleOver = (e) => {
      const el = e.target.closest('a, button, [data-hover]');
      if (el) {
        dotRef.current?.classList.add('cursor--hover');
        magnetTarget.current = el;
        setHovering(true);
      }
    };

    const handleOut = (e) => {
      const el = e.target.closest('a, button, [data-hover]');
      if (el) {
        dotRef.current?.classList.remove('cursor--hover');
        magnetTarget.current = null;
        setHovering(false);
      }
    };

    /* Decay velocity for blob scale */
    const tick = () => {
      velRef.current *= 0.82;
      if (blobRef.current) {
        const s = 1 + Math.min(velRef.current * 0.012, 0.45);
        blobRef.current.style.transform = `scale(${hovering ? 2.2 : s})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, [hovering]);

  return (
    <>
      <motion.div
        className="cursor-dot"
        ref={dotRef}
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
      />
      {/* Plain div so we can drive transform directly without Framer conflict */}
      <motion.div
        className={`cursor-blob${hovering ? ' cursor-blob--hover' : ''}`}
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      >
        <div ref={blobRef} className="cursor-blob__inner" />
      </motion.div>
    </>
  );
}
