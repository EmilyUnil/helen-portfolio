import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import Reveal from './Reveal';
import './About.css';

const skills = [
  { name: 'React / Next.js', level: 95 },
  { name: 'TypeScript', level: 88 },
  { name: 'CSS / Animations', level: 93 },
  { name: 'Three.js / WebGL', level: 72 },
  { name: 'Figma / UI Design', level: 82 },
  { name: 'Node.js', level: 68 },
];

function SkillBar({ skill, index }) {
  return (
    <motion.div
      className="skill-item"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
    >
      <div className="skill-item__header">
        <span className="skill-item__name">{skill.name}</span>
        <span className="skill-item__pct">{skill.level}%</span>
      </div>
      <div className="skill-item__track">
        <motion.div
          className="skill-item__fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.06, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

function TimelineItem({ exp, index }) {
  return (
    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6 }}
    >
      <div className="timeline-item__dot" />
      <div className="timeline-item__content">
        <span className="timeline-item__year">{exp.year}</span>
        <h4 className="timeline-item__role">{exp.role}</h4>
        {exp.company ? <p className="timeline-item__company">{exp.company}</p> : null}
      </div>
    </motion.div>
  );
}

export default function About() {
  const { t } = useLang();

  return (
    <section id="about">
      <div className="container">
        <div className="section-header">
          <Reveal delay={0}><p className="section-eyebrow">✦ About</p></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">{t.about.title}</h2></Reveal>
        </div>

        <div className="about-grid">
          {/* Left: text */}
          <div className="about-text">
            {[t.about.p1, t.about.p2, t.about.p3].map((p, i) => (
              <motion.p
                key={i}
                className="about-para"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
              >
                {p}
              </motion.p>
            ))}

            {/* Skills */}
            <motion.div
              className="about-skills"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {skills.map((s, i) => (
                <SkillBar key={s.name} skill={s} index={i} />
              ))}
            </motion.div>
          </div>

          {/* Right: timeline */}
          <div className="about-right">
            <motion.div
              className="about-timeline"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h3 className="about-timeline__title">{t.about.expTitle}</h3>
              <div className="timeline-list">
                {t.about.experience.map((exp, i) => (
                  <TimelineItem key={`${exp.year}-${exp.role}`} exp={exp} index={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
