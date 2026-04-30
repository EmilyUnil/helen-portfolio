import { useRef, useEffect } from 'react';

/* ─── GLSL shaders ────────────────────────────────────────────────────────── */

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/*
  Domain-warped FBM fluid — same technique used by shader.se style sites.
  Two levels of warping produce organic, slowly-morphing blobs of colour.
  Palette: near-black base → acid-lime (#c8f500) → violet (#8b5cf6).
  Overall brightness is kept very low so content stays readable.
*/
const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = p * 2.13 + vec2(1.7, 0.9);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.x   *= u_res.x / u_res.y;   /* aspect correct */

    float t = u_time * 0.14;

    /* Domain warping — two layers create the fluid look */
    vec2 q = vec2(
      fbm(uv * 2.8 + t),
      fbm(uv * 2.8 + vec2(5.2, 1.3) + t)
    );
    vec2 r = vec2(
      fbm(uv * 2.2 + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(uv * 2.2 + 3.0 * q + vec2(8.3, 2.8) + 0.13 * t)
    );
    float f = fbm(uv * 1.8 + 3.5 * r + t * 0.35);

    /* Palette */
    vec3 base   = vec3(0.05, 0.04, 0.07);
    vec3 lime   = vec3(0.78, 0.96, 0.0);     /* #c8f500 */
    vec3 violet = vec3(0.54, 0.36, 0.96);    /* #8b5cf6 */

    vec3 col = base;
    col = mix(col, violet, smoothstep(0.38, 0.72, f) * 0.55);
    col = mix(col, lime,   smoothstep(0.62, 1.0,  f) * 0.40);

    /* Subtle mouse glow */
    vec2 m = vec2(u_mouse.x / u_res.x * (u_res.x / u_res.y), u_mouse.y / u_res.y);
    float md = length(uv - m);
    col += lime * 0.07 * exp(-md * md * 5.0);

    /* Keep everything dark — just enough colour to feel alive */
    col = clamp(col * 0.30, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function ShaderBackground() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return;

    /* Compile helper */
    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* Full-screen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: window.innerHeight - e.clientY, /* WebGL Y is flipped */
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const t0 = performance.now();
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(uTime,  t);
      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        0,
        pointerEvents: 'none',
        display:       'block',
      }}
    />
  );
}
