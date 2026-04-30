import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import Icon from './Icon';
import './Layout.css';

function Navbar() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: t.nav.work, href: '#projects' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.stack, href: '#stack' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const scrollTo = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className={`nav-bar${scrolled ? ' nav-bar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nav-inner">
        {/* Logo */}
        <a href="#hero" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}>
          <span className="nav-logo__ht">HT</span>
          <span className="nav-logo__dot" />
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.label}>
              <button className="nav-link" onClick={() => scrollTo(l.href)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Controls */}
        <div className="nav-controls">
          {/* Lang toggle */}
          <button className="nav-pill" onClick={toggleLang} aria-label="Switch language">
            {lang === 'en' ? 'RU' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button className="nav-pill nav-pill--icon" onClick={toggleTheme} aria-label="Toggle theme">
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Mobile hamburger */}
          <button
            className={`nav-burger${menuOpen ? ' nav-burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {links.map((l, i) => (
              <motion.button
                key={l.label}
                className="nav-mobile__link"
                onClick={() => scrollTo(l.href)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                {l.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-logo">HT<span className="nav-logo__dot" /></div>
        <p className="footer-copy">
          {t.footer.copy} <span className="gradient-text">{t.footer.love}</span> {t.footer.and}
        </p>
      </div>
    </footer>
  );
}

function BgShapes() {
  return (
    <div className="bg-canvas" aria-hidden="true">
      <span className="bg-ring bg-ring--1" />
      <span className="bg-ring bg-ring--2" />
      <span className="bg-ring bg-ring--3" />
      <span className="bg-ring bg-ring--4" />
      <span className="bg-blob bg-blob--1" />
      <span className="bg-blob bg-blob--2" />
      <span className="bg-blob bg-blob--3" />
      <span className="bg-diamond bg-diamond--1" />
      <span className="bg-diamond bg-diamond--2" />
      <span className="bg-diamond bg-diamond--3" />
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <BgShapes />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
