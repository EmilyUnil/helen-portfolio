import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  const Tag = motion[as] ?? motion.div;

  return (
    <span
      ref={ref}
      className={`reveal-wrap${className ? ' ' + className : ''}`}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      <Tag
        initial={{ y: '105%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : {}}
        transition={{
          duration: 0.72,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ display: 'block' }}
      >
        {children}
      </Tag>
    </span>
  );
}
