# Helen Turlaeva — Portfolio

Ultra-modern React portfolio with:
- 🌙 Dark (neon blue + green) / ☀️ Light (yellow + pink) themes
- 🌍 EN / RU language switcher
- ✨ Framer Motion animations throughout
- 🎯 Custom cursor with blob effect
- 🗂 Bento grid project layout
- 📬 Contact form with confetti success animation
- 📱 Fully responsive

## Setup

```bash
# 1. Navigate into the folder
cd helen-portfolio

# 2. Install dependencies
npm install

# 3. Start dev server
npm start

# 4. Build for production
npm run build
```

## Customization

### Projects
Edit `src/data/projects.js` — add your real projects, change colors, tags, descriptions.

### About / Experience
Edit `src/context/LangContext.js` — update the `experience` arrays in both `en` and `ru` sections.

### Contact form
In `src/components/Contact.js`, replace the `await new Promise(...)` simulation with a real API call:
```js
const res = await fetch('https://your-api.com/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
});
const ok = res.ok;
```

Popular options: Formspree, EmailJS, Resend, your own Express backend.

### Avatar
In `src/components/Hero.js`, replace the SVG in `.hero-avatar__inner` with a `<img>` tag pointing to your photo:
```jsx
<img src="/your-photo.jpg" alt="Helen Turlaeva" className="hero-avatar__photo" />
```
Then add to Hero.css:
```css
.hero-avatar__photo {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
```

### Colors
All theme colors live in `src/styles/themes.css`. Change `--accent1`, `--accent2` etc.

### Fonts
Change the Google Fonts import in `src/styles/global.css` and update font-family references.

## Stack
- React 18
- Framer Motion 11
- Google Fonts (Syne + Epilogue)
- CSS Custom Properties for theming
- No other dependencies — keeps bundle tiny!
