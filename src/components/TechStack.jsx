import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import Reveal from './Reveal';
import './TechStack.css';

const techItems = [
  { name: 'React',         badge: 'Re', color: '#61dafb', category: 'Frontend'  },
  { name: 'TypeScript',    badge: 'Ts', color: '#3178c6', category: 'Language'  },
  { name: 'Next.js',       badge: 'Nx', color: '#aaaaaa', category: 'Framework' },
  { name: 'Three.js',      badge: '3J', color: '#00e5ff', category: '3D'        },
  { name: 'Framer Motion', badge: 'Fm', color: '#ff4ecd', category: 'Animation' },
  { name: 'Figma',         badge: 'Fi', color: '#f24e1e', category: 'Design'    },
  { name: 'GSAP',          badge: 'Gs', color: '#88ce02', category: 'Animation' },
  { name: 'Tailwind',      badge: 'Tw', color: '#38bdf8', category: 'CSS'       },
  { name: 'Node.js',       badge: 'No', color: '#68a063', category: 'Backend'   },
  { name: 'GraphQL',       badge: 'Gq', color: '#e535ab', category: 'API'       },
  { name: 'Vite',          badge: 'Vi', color: '#bd34fe', category: 'Tooling'   },
  { name: 'Git',           badge: 'Gt', color: '#f05032', category: 'Tooling'   },
  { name: 'WebGL',         badge: 'Wg', color: '#9900cc', category: '3D'        },
  { name: 'Storybook',     badge: 'Sb', color: '#ff4785', category: 'Tooling'   },
  { name: 'Vercel',        badge: 'Vc', color: '#aaaaaa', category: 'Deploy'    },
];

function TechChip({ tech }) {
  return (
    <div className="tech-chip" style={{ '--tech-color': tech.color }}>
      <span
        className="tech-chip__badge"
        style={{
          background: `${tech.color}18`,
          border: `1px solid ${tech.color}30`,
          color: tech.color,
        }}
      >
        {tech.badge}
      </span>
      <span className="tech-chip__name">{tech.name}</span>
      <span className="tech-chip__sep" aria-hidden="true">·</span>
      <span className="tech-chip__cat">{tech.category}</span>
    </div>
  );
}

/* Velocity-driven marquee — pauses + slows on hover, speeds on fast mouse */
function Marquee() {
  const trackRef   = useRef(null);
  const posRef     = useRef(0);
  const velRef     = useRef(0);     // extra mouse velocity boost
  const pauseRef   = useRef(false);
  const prevMouseX = useRef(0);
  const rafRef     = useRef(null);
  const BASE_SPEED = 0.5;           // px per frame at 60 fps

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onMouseMove = (e) => {
      const dx = Math.abs(e.clientX - prevMouseX.current);
      prevMouseX.current = e.clientX;
      velRef.current = Math.min(dx * 0.25, 6);
    };

    const onEnter = () => { pauseRef.current = true; };
    const onLeave = () => { pauseRef.current = false; };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousemove', onMouseMove);

    const groupWidth = track.children[0]?.scrollWidth ?? 0;

    const tick = () => {
      if (!pauseRef.current) {
        const speed = BASE_SPEED + velRef.current;
        posRef.current -= speed;
        if (Math.abs(posRef.current) >= groupWidth) posRef.current = 0;
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      velRef.current *= 0.92;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="tech-marquee-clip">
      <div className="tech-marquee-track" ref={trackRef}>
        <div className="tech-group">
          {techItems.map((tech) => <TechChip key={tech.name} tech={tech} />)}
        </div>
        <div className="tech-group" aria-hidden="true">
          {techItems.map((tech) => <TechChip key={`d-${tech.name}`} tech={tech} />)}
        </div>
      </div>
    </div>
  );
}

export default function TechStack() {
  const { t } = useLang();

  return (
    <section id="stack">
      <div className="container">
        <div className="section-header">
          <Reveal delay={0}><p className="section-eyebrow">✦ Toolbox</p></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">{t.stack.title}</h2></Reveal>
          <Reveal delay={0.2}><p className="section-sub">{t.stack.sub}</p></Reveal>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Marquee />
      </motion.div>
    </section>
  );
}
