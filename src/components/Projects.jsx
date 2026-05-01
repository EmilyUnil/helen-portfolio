import { useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { projects } from '../data/projects';
import Icon from './Icon';
import './Projects.css';

const R           = 320;
const PITCH       = 130;
const Z_OFFSET    = -180;
const FACE_STR    = 44;
const BLUR_MAX    = 10;
const OPA_BACK    = 0.2;
const OPA_FRONT   = 0.88;
const THRESHOLD   = 0.42;
const CAM_LERP    = 0.08;
const SHARPNESS   = 12;

export default function Projects() {
  const { t, lang } = useLang();
  const sectionRef  = useRef(null);
  const cardRefs    = useRef([]);
  const camRef      = useRef({ x: 0, y: 0 });
  const tickingRef  = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const clamp = (v) => Math.max(0, Math.min(1, v));
    const lerp  = (a, b, t) => a + (b - a) * t;

    function progress() {
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return clamp(total <= 0 ? 0 : -r.top / total);
    }

    function update() {
      tickingRef.current = false;
      const cards = cardRefs.current.filter(Boolean);
      if (!cards.length) return;

      const t     = progress();
      const N     = cards.length;
      const step  = (Math.PI * 2) / N;
      const phase = Math.PI / 2 + t * (N - 1) * step;

      const poses = cards.map((_, i) => {
        const a      = phase - i * step;
        const x      = Math.cos(a) * R;
        const z      = Math.sin(a) * R + Z_OFFSET;
        const y      = -a * PITCH;
        const facing = (Math.sin(a) + 1) / 2;
        return { a, x, y, z, facing };
      });

      let sumW = 0, tx = 0, ty = 0;
      poses.forEach(p => {
        const w = Math.pow(Math.max(0, p.facing), SHARPNESS);
        sumW += w; tx += p.x * w; ty += p.y * w;
      });
      if (sumW > 0) { tx /= sumW; ty /= sumW; }

      camRef.current.x = lerp(camRef.current.x, -tx, CAM_LERP);
      camRef.current.y = lerp(camRef.current.y, -ty, CAM_LERP);

      cards.forEach((card, i) => {
        const { a, x, y, z, facing } = poses[i];
        const x2      = x + camRef.current.x;
        const y2      = y + camRef.current.y;
        const yaw     = Math.cos(a) * -FACE_STR;
        const isBack  = facing < THRESHOLD;
        const blur    = isBack ? lerp(2, BLUR_MAX, (THRESHOLD - facing) / THRESHOLD) : 0;
        const opacity = isBack
          ? lerp(OPA_BACK,  0.55, facing / THRESHOLD)
          : lerp(OPA_FRONT, 1.0,  (facing - THRESHOLD) / (1 - THRESHOLD));
        const scale   = lerp(0.82, 1.04, Math.pow(facing, 1.9));
        const zIndex  = Math.round((z - Z_OFFSET + R) * 10);

        card.style.transform    = `translate3d(-50%,-50%,0) translate3d(${x2}px,${y2}px,${z}px) rotateY(${yaw}deg) scale(${scale})`;
        card.style.filter       = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
        card.style.opacity      = opacity.toFixed(3);
        card.style.zIndex       = zIndex;
        card.style.pointerEvents = facing > 0.6 ? 'auto' : 'none';
      });
    }

    function onScroll() {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(update);
      }
    }

    const onResize = () => requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // settle camera before first interaction
    for (let i = 0; i < 8; i++) update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="projects-section">

      {/* ── Desktop spiral ── */}
      <div className="projects-sticky">

        <div className="projects-header container">
          <p className="section-eyebrow">✦ {t.projects.sub}</p>
          <h2 className="section-title">{t.projects.title}</h2>
        </div>

        <div className="projects-stage" aria-hidden="true">
          <div className="projects-spiral">
            {projects.map((project, i) => (
              <a
                key={project.id}
                ref={el => { cardRefs.current[i] = el; }}
                className="spiral-card"
                href={project.href !== '#' ? project.href : undefined}
                target={project.href !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{ '--card-accent': project.color }}
              >
                <div className="spiral-card__bg" />
                <div className="spiral-card__content">
                  <div className="spiral-card__top">
                    <span className="spiral-card__icon">
                      <Icon name={project.icon} size={20} />
                    </span>
                    <span className="spiral-card__year">{project.year}</span>
                  </div>
                  <div className="spiral-card__body">
                    <h3 className="spiral-card__title">
                      {lang === 'ru' ? project.titleRu : project.title}
                    </h3>
                    <p className="spiral-card__desc">
                      {lang === 'ru' ? project.descRu : project.desc}
                    </p>
                  </div>
                  <div className="spiral-card__footer">
                    <div className="spiral-card__tags">
                      {project.tags.map(tag => (
                        <span key={tag} className="spiral-card__tag">{tag}</span>
                      ))}
                    </div>
                    {project.href !== '#' && (
                      <span className="spiral-card__cta">{t.projects.viewProject} →</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="projects-scroll-hint">↓ {t.projects.sub.toLowerCase()}</p>
      </div>

      {/* ── Mobile fallback ── */}
      <div className="mobile-cards">
        <p className="section-eyebrow">✦ {t.projects.sub}</p>
        <h2 className="section-title" style={{ marginBottom: '2rem' }}>
          {t.projects.title}
        </h2>
        {projects.map(project => (
          <div key={project.id} className="mobile-card" style={{ '--card-accent': project.color }}>
            <div className="hcard__header">
              <span className="hcard__icon"><Icon name={project.icon} size={16} /></span>
              <span className="hcard__year">{project.year}</span>
            </div>
            <h3 className="hcard__title" style={{ marginTop: '1rem' }}>
              {lang === 'ru' ? project.titleRu : project.title}
            </h3>
            <p className="hcard__desc">
              {lang === 'ru' ? project.descRu : project.desc}
            </p>
            <div className="hcard__tags" style={{ marginTop: '0.75rem' }}>
              {project.tags.map(tag => (
                <span key={tag} className="hcard__tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
