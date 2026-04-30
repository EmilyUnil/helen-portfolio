import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext();

const translations = {
  en: {
    nav: {
      work: 'Work',
      about: 'About',
      stack: 'Stack',
      contact: 'Contact',
    },
    hero: {
      greeting: "Hi, I'm",
      name: 'Helen Turlaeva',
      role: 'Frontend Developer',
      tagline: 'I craft experiences\nthat people remember.',
      sub: 'Turning complex ideas into beautiful, fast, and accessible web products.',
      cta: 'See my work',
      cta2: "Let's talk",
      scroll: 'Scroll to explore',
      available: 'Available for work',
    },
    projects: {
      title: 'Selected Work',
      sub: "Projects I'm proud of",
      all: 'All Projects',
      filters: ['All', 'React', 'Three.js', 'Mobile', 'UI/UX'],
      viewProject: 'View Project',
      viewCase: 'Case Study',
    },
    about: {
      title: 'About Me',
      p1: "I'm a frontend developer with a designer's eye. I believe the web should be beautiful, fast, and accessible - all three at once, not one at the expense of the others.",
      p2: "When I'm not pushing pixels or arguing with CSS, I'm probably exploring new interaction patterns, watching motion design talks, or making my third coffee of the morning.",
      p3: 'I work best when given creative freedom and a problem worth solving.',
      expTitle: 'Project Timeline',
      experience: [
        { year: '2026', role: 'Meditation App' },
        { year: '2025', role: 'Re:Agent' },
        { year: '2025', role: 'Hotel Booking' },
        { year: '2024', role: 'House of Bakery' },
        { year: '2024', role: 'Flower Shop' },
        { year: '2023', role: 'Travel Site' },
      ],
    },
    stack: {
      title: 'Tech Stack',
      sub: 'Tools I use every day',
    },
    contact: {
      title: "Let's build\nsomething great",
      sub: "Have a project in mind? I'd love to hear about it.",
      name: 'Your name',
      email: 'Your email',
      message: 'Tell me about your project...',
      send: 'Send message',
      sending: 'Sending...',
      success: "Message sent! I'll get back to you soon.",
      error: 'Oops! Something went wrong. Try again.',
      or: 'Or reach me directly',
    },
    footer: {
      copy: '© 2026 Helen Turlaeva. Built with',
      love: 'love',
      and: 'and too much coffee.',
    },
  },
  ru: {
    nav: {
      work: 'Работы',
      about: 'О себе',
      stack: 'Стек',
      contact: 'Контакты',
    },
    hero: {
      greeting: 'Привет, я',
      name: 'Елена Турлаева',
      role: 'Frontend-разработчик',
      tagline: 'Создаю интерфейсы,\nкоторые запоминаются.',
      sub: 'Превращаю сложные идеи в красивые, быстрые и доступные веб-продукты.',
      cta: 'Мои проекты',
      cta2: 'Поговорим',
      scroll: 'Листайте вниз',
      available: 'Открыта к работе',
    },
    projects: {
      title: 'Избранные работы',
      sub: 'Проекты, которыми я горжусь',
      all: 'Все проекты',
      filters: ['Все', 'React', 'Three.js', 'Mobile', 'UI/UX'],
      viewProject: 'Открыть проект',
      viewCase: 'Кейс',
    },
    about: {
      title: 'О себе',
      p1: 'Я frontend-разработчик с дизайнерским взглядом. Убеждена, что веб должен быть красивым, быстрым и доступным - всё сразу, а не одно за счёт другого.',
      p2: 'Когда я собираю интерфейсы, мне важно, чтобы они были не только аккуратными, но и живыми, удобными и понятными для человека.',
      p3: 'Лучше всего работаю, когда есть творческая свобода и задача, достойная хорошего решения.',
      expTitle: 'Хронология проектов',
      experience: [
        { year: '2026', role: 'Meditation App' },
        { year: '2025', role: 'Re:Agent' },
        { year: '2025', role: 'Hotel Booking' },
        { year: '2024', role: 'House of Bakery' },
        { year: '2024', role: 'Flower Shop' },
        { year: '2023', role: 'Travel Site' },
      ],
    },
    stack: {
      title: 'Технологии',
      sub: 'Инструменты, которые использую каждый день',
    },
    contact: {
      title: 'Давайте создадим\nчто-то крутое',
      sub: 'Есть проект? Расскажите мне о нём.',
      name: 'Ваше имя',
      email: 'Ваш email',
      message: 'Расскажите о проекте...',
      send: 'Отправить',
      sending: 'Отправляем...',
      success: 'Сообщение отправлено! Скоро отвечу.',
      error: 'Ой! Что-то пошло не так. Попробуйте ещё раз.',
      or: 'Или напишите напрямую',
    },
    footer: {
      copy: '© 2026 Елена Турлаева. Сделано с',
      love: 'любовью',
      and: 'и большим количеством кофе.',
    },
  },
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ht-lang') || 'en');

  const toggle = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('ht-lang', next);
  };

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
