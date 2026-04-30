import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import './Scene3D.css';

// ─── 3D math ────────────────────────────────────────────────────────────────

function rotateX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotateY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotateZ(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}
function project(p, fov, cx, cy) {
  const z = p.z + fov;
  const scale = fov / Math.max(z, 0.1);
  return { x: p.x * scale + cx, y: p.y * scale + cy, scale };
}

// ─── Shapes ──────────────────────────────────────────────────────────────────

function makeCube(s) {
  const h = s / 2;
  const verts = [
    { x: -h, y: -h, z: -h }, { x:  h, y: -h, z: -h },
    { x:  h, y:  h, z: -h }, { x: -h, y:  h, z: -h },
    { x: -h, y: -h, z:  h }, { x:  h, y: -h, z:  h },
    { x:  h, y:  h, z:  h }, { x: -h, y:  h, z:  h },
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ];
  const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
  return { verts, edges, faces };
}

function makeOctahedron(s) {
  const verts = [
    { x: 0, y: -s, z:  0 }, { x:  s, y: 0, z: 0 },
    { x: 0, y:  0, z:  s }, { x: -s, y: 0, z: 0 },
    { x: 0, y:  0, z: -s }, { x:  0, y: s, z: 0 },
  ];
  const edges = [
    [0,1],[0,2],[0,3],[0,4],
    [5,1],[5,2],[5,3],[5,4],
    [1,2],[2,3],[3,4],[4,1],
  ];
  const faces = [
    [0,1,2],[0,2,3],[0,3,4],[0,4,1],
    [5,1,2],[5,2,3],[5,3,4],[5,4,1],
  ];
  return { verts, edges, faces };
}

function makeIcosahedron(s) {
  const t = (1 + Math.sqrt(5)) / 2;
  const n = s / Math.sqrt(1 + t * t);
  const verts = [
    { x: -n, y:  n * t, z:  0 }, { x:  n, y:  n * t, z:  0 },
    { x: -n, y: -n * t, z:  0 }, { x:  n, y: -n * t, z:  0 },
    { x:  0, y: -n,     z:  n * t }, { x:  0, y:  n,     z:  n * t },
    { x:  0, y: -n,     z: -n * t }, { x:  0, y:  n,     z: -n * t },
    { x:  n * t, y: 0,  z: -n }, { x:  n * t, y: 0,  z:  n },
    { x: -n * t, y: 0,  z: -n }, { x: -n * t, y: 0,  z:  n },
  ];
  const faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];
  const edgeSet = new Set();
  const edges = [];
  faces.forEach(([a, b, c]) => {
    [[a, b], [b, c], [c, a]].forEach(([p, q]) => {
      const key = Math.min(p, q) + '-' + Math.max(p, q);
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([p, q]); }
    });
  });
  return { verts, edges, faces };
}

function makeTorus(R, r, segsO, segsI) {
  const verts = [];
  for (let i = 0; i < segsO; i++) {
    const theta = (i / segsO) * Math.PI * 2;
    for (let j = 0; j < segsI; j++) {
      const phi = (j / segsI) * Math.PI * 2;
      verts.push({
        x: (R + r * Math.cos(phi)) * Math.cos(theta),
        y: r * Math.sin(phi),
        z: (R + r * Math.cos(phi)) * Math.sin(theta),
      });
    }
  }
  const edges = [];
  for (let i = 0; i < segsO; i++) {
    for (let j = 0; j < segsI; j++) {
      edges.push([i * segsI + j, i * segsI + (j + 1) % segsI]);
      edges.push([i * segsI + j, ((i + 1) % segsO) * segsI + j]);
    }
  }
  return { verts, edges, faces: [] };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Scene3D() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999, inside: false });
  const { theme } = useTheme();
  const { t } = useLang();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const shapes = [
      {
        geo: makeCube(62),
        pos: { x: -215, y: 10, z: 0 },
        rot: { x: 0.4, y: 0.3, z: 0.1 },
        vel: { x: 0.006, y: 0.009, z: 0.003 },
        baseVel: { x: 0.006, y: 0.009, z: 0.003 },
        color: 'accent1',
        label: 'CSS',
      },
      {
        geo: makeOctahedron(60),
        pos: { x: -60, y: -15, z: -20 },
        rot: { x: 0.2, y: 0.5, z: 0.3 },
        vel: { x: 0.008, y: 0.005, z: 0.007 },
        baseVel: { x: 0.008, y: 0.005, z: 0.007 },
        color: 'accent2',
        label: 'Next.js',
      },
      {
        geo: makeIcosahedron(54),
        pos: { x: 88, y: 15, z: 10 },
        rot: { x: 0.6, y: 0.1, z: 0.4 },
        vel: { x: 0.004, y: 0.01, z: 0.005 },
        baseVel: { x: 0.004, y: 0.01, z: 0.005 },
        color: 'accent3',
        label: 'React',
      },
    ];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Background floating particles (seeded at init so they don't jump on resize)
    let bgParticles = [];
    const initParticles = () => {
      bgParticles = Array.from({ length: 35 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.35,
        colorIdx: Math.floor(Math.random() * 3),
        alpha: Math.random() * 0.30 + 0.07,
      }));
    };
    initParticles();

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        inside: true,
      };
    };
    const onMouseLeave = () => { mouseRef.current.inside = false; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const fov = 340;
      shapes.forEach(shape => {
        const cp = project(shape.pos, fov, cx, cy);
        if (Math.hypot(mx - cp.x, my - cp.y) < 100) {
          shape.vel.x += (Math.random() - 0.5) * 0.14;
          shape.vel.y += (Math.random() - 0.5) * 0.14;
          shape.vel.z += (Math.random() - 0.5) * 0.06;
        }
      });
    };
    canvas.addEventListener('click', onClick);

    const fov = 340;
    let animId;

    const getColors = () => {
      const st = getComputedStyle(document.documentElement);
      return {
        accent1: st.getPropertyValue('--accent1').trim() || '#c8f500',
        accent2: st.getPropertyValue('--accent2').trim() || '#ffffff',
        accent3: st.getPropertyValue('--accent3').trim() || '#8b5cf6',
      };
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      const colors  = getColors();
      const colorArr = [colors.accent1, colors.accent2, colors.accent3];

      // Use actual canvas px coords for mouse (fixes old bounding-box bug)
      const mx = mouseRef.current.inside ? mouseRef.current.x : cx;
      const my = mouseRef.current.inside ? mouseRef.current.y : cy;

      // ── Background drifting particles ────────────────────────────────────
      bgParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        if (p.y > H + 4) p.y = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle  = colorArr[p.colorIdx];
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ── Find hovered shape (closest projected center within 100px) ───────
      let hoveredShape = null;
      let closestDist  = 100;
      if (mouseRef.current.inside) {
        shapes.forEach((shape, si) => {
          const cp   = project(shape.pos, fov, cx, cy);
          const dist = Math.hypot(mx - cp.x, my - cp.y);
          if (dist < closestDist) { closestDist = dist; hoveredShape = si; }
        });
      }

      const rotInflX = (my - cy) / H;
      const rotInflY = (mx - cx) / W;

      // ── Draw each shape ───────────────────────────────────────────────────
      shapes.forEach((shape, si) => {
        const isHovered = hoveredShape === si;

        shape.rot.x += shape.vel.x + rotInflX * 0.007;
        shape.rot.y += shape.vel.y + rotInflY * 0.007;
        shape.rot.z += shape.vel.z * 0.4;

        // Damp velocity toward base
        shape.vel.x += (shape.baseVel.x - shape.vel.x) * 0.012;
        shape.vel.y += (shape.baseVel.y - shape.vel.y) * 0.012;
        shape.vel.z += (shape.baseVel.z - shape.vel.z) * 0.012;

        const color = colors[shape.color] || '#c8f500';
        const { verts, edges } = shape.geo;

        const tv = verts.map(v => {
          let p = { ...v };
          p = rotateX(p, shape.rot.x);
          p = rotateY(p, shape.rot.y);
          p = rotateZ(p, shape.rot.z);
          p.x += shape.pos.x;
          p.y += shape.pos.y;
          p.z += shape.pos.z;
          return p;
        });
        const pv = tv.map(p => project(p, fov, cx, cy));

        // ── Edges (neon glow only on hover — shadowBlur is expensive) ─────
        ctx.save();
        if (isHovered) {
          ctx.shadowBlur  = 22;
          ctx.shadowColor = color;
        }

        edges.forEach(([a, b]) => {
          const depth  = (tv[a].z + tv[b].z) / 2;
          const dAlpha = Math.max(0.14, Math.min(0.95, 1 - depth / 460));
          ctx.beginPath();
          ctx.moveTo(pv[a].x, pv[a].y);
          ctx.lineTo(pv[b].x, pv[b].y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = isHovered ? dAlpha : dAlpha * 0.47;
          ctx.lineWidth   = isHovered ? 1.8 : 1.0;
          ctx.stroke();
        });

        ctx.globalAlpha = 1;
        ctx.restore();

        // ── Vertex dots ────────────────────────────────────────────────────
        pv.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, isHovered ? 3 : 1.7, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.globalAlpha = isHovered ? 0.95 : 0.37;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // ── Label at projected center ──────────────────────────────────────
        const cp = project(shape.pos, fov, cx, cy);
        ctx.font        = `700 11px 'Syne', sans-serif`;
        ctx.fillStyle   = color;
        ctx.globalAlpha = isHovered ? 1 : 0.37;
        ctx.textAlign   = 'center';
        ctx.fillText(shape.label, cp.x, cp.y + 68);
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, [theme]);

  return (
    <section id="scene3d" className="scene3d">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">✦ Interactive</p>
          <h2 className="section-title">3D Playground</h2>
          <p className="scene3d__hint">Move cursor to rotate · Click shapes to spin</p>
        </motion.div>

        <motion.div
          className="scene3d__canvas-wrap"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <canvas ref={canvasRef} className="scene3d__canvas" />
          <div className="scene3d__overlay-hint">
            <span className="scene3d__hint-tag">CSS</span>
            <span className="scene3d__hint-sep">×</span>
            <span className="scene3d__hint-tag">Next.js</span>
            <span className="scene3d__hint-sep">×</span>
            <span className="scene3d__hint-tag">React</span>
            <span className="scene3d__hint-sep">×</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
