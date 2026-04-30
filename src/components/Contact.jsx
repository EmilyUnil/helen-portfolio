import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LangContext';
import Icon from './Icon';
import Reveal from './Reveal';
import './Contact.css';

function Confetti({ active }) {
  if (!active) return null;

  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['var(--accent1)', 'var(--accent2)', 'var(--accent3)', 'var(--accent4)'][i % 4],
    delay: Math.random() * 0.4,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="confetti-piece"
          style={{ left: `${p.x}%`, background: p.color, rotate: p.rotate }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{ y: -150, opacity: 0, scale: 0.5, rotate: p.rotate + 180 }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [confetti, setConfetti] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const ok = true;

    if (ok) {
      setStatus('success');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
      setForm({ name: '', email: '', message: '' });
    } else {
      setStatus('error');
    }

    setTimeout(() => setStatus('idle'), 4000);
  };

  const tagLines = t.contact.title.split('\n');

  return (
    <section id="contact">
      <div className="container">
        <div className="contact-grid">
          <motion.div
            className="contact-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Reveal delay={0}><p className="section-eyebrow">✦ Contact</p></Reveal>
            <h2 className="contact-title">
              {tagLines.map((line, index) => (
                <Reveal key={index} delay={0.1 + index * 0.1}>
                  <span className={index === 1 ? 'gradient-text' : ''}>{line}</span>
                </Reveal>
              ))}
            </h2>
            <p className="contact-sub">{t.contact.sub}</p>

            <div className="contact-links">
              <p className="contact-links__or">{t.contact.or}</p>
              <a href="mailto:elena90373@gmail.com" className="contact-email" data-hover="true">
                elena90373@gmail.com →
              </a>
              <div className="contact-social">
                {[
                  { label: 'GitHub', icon: 'github', href: 'https://github.com/EmilyUnil' },
                  { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social__link"
                    data-hover="true"
                  >
                    <Icon name={social.icon} size={18} />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <Confetti active={confetti} />

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t.contact.name}</label>
                  <input
                    className="form-input"
                    type="text"
                    name="name"
                    placeholder={lang === 'ru' ? 'Елена' : 'Helen'}
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.contact.email}</label>
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.contact.message}</label>
                <textarea
                  className="form-input form-textarea"
                  name="message"
                  placeholder={t.contact.message}
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    className="form-status form-status--success"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {t.contact.success}
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    className="form-status form-status--error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {t.contact.error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className="btn btn--primary contact-submit"
                type="submit"
                disabled={status === 'sending'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-hover="true"
              >
                {status === 'sending' ? <span className="contact-submit__spinner" /> : null}
                {status === 'sending' ? t.contact.sending : t.contact.send}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
