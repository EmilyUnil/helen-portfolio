import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Scene3D from './components/Scene3D';
import About from './components/About';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import CustomCursor from './components/CustomCursor';
import './styles/global.css';
import './styles/themes.css';

function AppInner() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf;
    function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <Layout>
        <Hero />
        <Projects />
        <Scene3D />
        <About />
        <TechStack />
        <Contact />
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppInner />
      </LangProvider>
    </ThemeProvider>
  );
}
