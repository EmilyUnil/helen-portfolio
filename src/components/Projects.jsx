import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { projects } from '../data/projects';
import Icon from './Icon';
import './Projects.css';

/*
  Horizontal scroll track — each project card slides in from the right
  as the user scrolls down. No 3D tricks, no physics complexity.

  Architecture:
    section  { height: 100vh + N * 520px }
      sticky { position: sticky; top: 0; height: 100vh }
        track-wrap  { overflow: hidden }
          track      { display: flex; translateX driven by scroll }
            card × N
*/

const N         = projects.length;
const CARD_W    = 480;   // px — card width
const GAP       = 32;    // px — gap between cards
const SCROLL_PX = N * 520;

export default function Projects() {
  const { t, lang } = useLang();
  const sectionRef  = useRef(null);
  const [rawProgress, setRawProgress] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset:  ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping:   22,
    mass:      0.4,
  });

  useEffect(() => scrollYProgress.on('change', setRawProgress), [scrollYProgress]);
  useEffect(() => smoothProgress.on('change', setVisualProgress), [smoothProgress]);

  const activeIndex = Math.min(N - 1, Math.max(0, Math.round(visualProgress * (N - 1))));
  const activeProject = projects[activeIndex];

  // Track moves left as user scrolls.
  // At progress=0 → translateX=0 (first card visible).
  // At progress=1 → track shifts enough to bring last card to center.
  const trackX = useTransform(
    smoothProgress,
    [0, 1],
    [0, -((N - 1) * (CARD_W + GAP))],
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="projects-section"
      style={{ height: `calc(100vh + ${SCROLL_PX}px)` }}
    >
      <div className="projects-sticky">

        {/* ── Colour backdrop ────────────────────────────────────────────── */}
        <motion.div
          className="projects-backdrop"
          animate={{
            background: `radial-gradient(ellipse 60% 55% at 70% 45%, ${activeProject.color}1a 0%, transparent 65%)`,
          }}
          transition={{ duration: 0.7 }}
        />

        {/* ── Top bar: section title + counter ──────────────────────────── */}
        <div className="projects-topbar container">
          <div>
            <p className="section-eyebrow">✦ {t.projects.sub}</p>
            <h2 className="section-title">{t.projects.title}</h2>
          </div>

          <div className="projects-counter">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={activeIndex}
                className="projects-counter__cur"
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0,   opacity: 1 }}
                exit={{    y:  14, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {String(activeIndex + 1).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="projects-counter__sep">/</span>
            <span className="projects-counter__total">
              {String(N).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* ── Horizontal card track ──────────────────────────────────────── */}
        <div className="track-wrap">
          <motion.div
            className="track"
            style={{ x: trackX }}
          >
            {projects.map((project, i) => {
              const isActive = i === activeIndex;
              const relDist  = i - visualProgress * (N - 1); // float distance from viewport centre

              return (
                <motion.article
                  key={project.id}
                  className={`hcard${isActive ? ' hcard--active' : ''}`}
                  style={{ '--card-accent': project.color }}
                  animate={{
                    opacity: Math.max(0.35, 1 - Math.abs(relDist) * 0.28),
                    scale:   Math.max(0.88, 1 - Math.abs(relDist) * 0.06),
                    y:       Math.abs(relDist) * 18,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                >
                  <div className="hcard__glow" />

                  {/* Card header */}
                  <div className="hcard__header">
                    <span className="hcard__icon">
                      <Icon name={project.icon} size={20} />
                    </span>
                    <div className="hcard__meta">
                      <span className="hcard__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="hcard__year">{project.year}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="hcard__body">
                    <h3 className="hcard__title">
                      {lang === 'ru' ? project.titleRu : project.title}
                    </h3>
                    <p className="hcard__desc">
                      {lang === 'ru' ? project.descRu : project.desc}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="hcard__tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="hcard__tag">{tag}</span>
                    ))}
                  </div>

                  {/* CTA — visible only on active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="hcard__cta-wrap"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{    opacity: 0, y: 8 }}
                        transition={{ duration: 0.22 }}
                      >
                        {project.href && project.href !== '#' ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hcard__cta"
                          >
                            View Project →
                          </a>
                        ) : (
                          <span className="hcard__cta hcard__cta--disabled">
                            Coming Soon
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* ── Bottom bar: project info + dots ───────────────────────────── */}
        <div className="projects-bottombar container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="projects-info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <span className="projects-info__accent" style={{ color: activeProject.color }}>
                <Icon name={activeProject.icon} size={13} />
                {lang === 'ru' ? activeProject.titleRu : activeProject.title}
              </span>
              <p className="projects-info__desc">
                {lang === 'ru' ? activeProject.descRu : activeProject.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="projects-dots">
            {projects.map((_, i) => (
              <motion.span
                key={i}
                className="projects-dot"
                animate={
                  i === activeIndex
                    ? { scaleX: 2.6, backgroundColor: activeProject.color }
                    : { scaleX: 1 }
                }
                transition={{ duration: 0.25 }}
              />
            ))}
          </div>
        </div>

        {/* ── Scroll hint ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {rawProgress < 0.04 && (
            <motion.p
              className="projects-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              ↓ scroll to explore projects
            </motion.p>
          )}
        </AnimatePresence>

      </div>

      {/* Mobile fallback */}
      <div className="mobile-cards">
        <p className="section-eyebrow">✦ {t.projects.sub}</p>
        <h2 className="section-title" style={{ marginBottom: '2rem' }}>
          {t.projects.title}
        </h2>
        {projects.map((project) => (
          <div key={project.id} className="mobile-card" style={{ '--card-accent': project.color }}>
            <div className="hcard__header">
              <span className="hcard__icon">
                <Icon name={project.icon} size={16} />
              </span>
              <span className="hcard__year">{project.year}</span>
            </div>
            <h3 className="hcard__title" style={{ marginTop: '1rem' }}>
              {lang === 'ru' ? project.titleRu : project.title}
            </h3>
            <p className="hcard__desc">{lang === 'ru' ? project.descRu : project.desc}</p>
            <div className="hcard__tags" style={{ marginTop: '0.75rem' }}>
              {project.tags.map((tag) => (
                <span key={tag} className="hcard__tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
