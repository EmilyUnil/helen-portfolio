import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import ShaderBackground from './ShaderBackground';
import Reveal from './Reveal';
import './Hero.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { y: 48, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

function BrowserMockup() {
  return (
    <div className="hero-screen">
      {/* Browser chrome */}
      <div className="hero-screen__chrome">
        <div className="hero-screen__dots">
          <span /><span /><span />
        </div>
        <div className="hero-screen__bar" />
        <div className="hero-screen__actions">
          <span /><span /><span />
        </div>
      </div>

      {/* Screen body */}
      <div className="hero-screen__body">
        <div className="hero-screen__mono">HT</div>
        <div className="hero-screen__lines" aria-hidden="true">
          <span style={{ width: '72%' }} />
          <span style={{ width: '55%' }} />
          <span style={{ width: '84%' }} />
          <span style={{ width: '40%' }} />
          <span style={{ width: '66%' }} />
        </div>
      </div>

      {/* Floating tech chips */}
      <motion.div
        className="hero-chip hero-chip--1"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        &lt;/&gt;
      </motion.div>

      <motion.div
        className="hero-chip hero-chip--2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        React
      </motion.div>

      <motion.div
        className="hero-chip hero-chip--3"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        TS
      </motion.div>

      {/* Decorative asterisk */}
      <div className="hero-deco hero-deco--star" aria-hidden="true">✦</div>
      <div className="hero-deco hero-deco--grid" aria-hidden="true" />
    </div>
  );
}

export default function Hero() {
  const { t } = useLang();
  const { theme } = useTheme();

  const scrollToWork = () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });

  const tagLines = t.hero.tagline.split('\n');

  return (
    <section id="hero" className="hero">
      {/* WebGL shader background — dark mode only */}
      {theme === 'dark' && <ShaderBackground />}

      {/* Ambient glow */}
      <div className="hero-orbs" aria-hidden="true">
        <motion.div
          className="hero-orb"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container hero-inner">
        {/* Left — text content */}
        <motion.div
          className="hero-content"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="hero-badge" variants={item}>
            <span className="hero-badge__dot" />
            {t.hero.available}
          </motion.div>

          <motion.p className="hero-greeting" variants={item}>
            {t.hero.greeting}
          </motion.p>

          <motion.h1 className="hero-name" variants={item} style={{ overflow: 'hidden' }}>
            <Reveal delay={0.3} as="span">
              <span className="gradient-text">{t.hero.name.split(' ')[0]}</span>
              {' '}
              <span>{t.hero.name.split(' ').slice(1).join(' ')}</span>
            </Reveal>
          </motion.h1>

          <motion.div className="hero-role-wrap" variants={item}>
            <span className="hero-role">{t.hero.role}</span>
          </motion.div>

          <motion.div className="hero-tagline" variants={item}>
            {tagLines.map((line, i) => (
              <Reveal key={i} delay={0.45 + i * 0.1}>
                <div className="hero-tagline__line">{line}</div>
              </Reveal>
            ))}
          </motion.div>

          <motion.p className="hero-sub" variants={item}>
            {t.hero.sub}
          </motion.p>

          <motion.div className="hero-ctas" variants={item}>
            <button className="btn btn--primary" onClick={scrollToWork}>
              {t.hero.cta}
              <span className="btn__arrow">→</span>
            </button>
            <button className="btn btn--ghost" onClick={scrollToContact}>
              {t.hero.cta2}
            </button>
          </motion.div>
        </motion.div>

        {/* Right — browser mockup */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrowserMockup />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.div
          className="hero-scroll__wheel"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span>{t.hero.scroll}</span>
      </motion.div>
    </section>
  );
}
