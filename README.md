# Sveltekit + Tailwind CSS + Shadcn svelte Boilerplate with Darkmode & Wuchale i18n

This is a modern boilerplate project for getting started with a web development project using SvelteKit, Tailwind CSS, and internationalization support, powered by Vite.

## 🎯 Features

- ✅ **SvelteKit**: Modern web framework with excellent performance and developer experience
- ✅ **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- ✅ **Dark Pink Theme**: Beautiful dark pink color scheme with light/dark mode toggle
- ✅ **Mobile-First Design**: Responsive navigation with mobile hamburger menu
- ✅ **Internationalization (i18n)**: Multi-language support with Wuchale
- ✅ **Language Support**: English, Czech (Čeština), and Russian (Русский)
- ✅ **Shadcn/ui Components**: Modern, accessible UI components
- ✅ **Vite**: Fast development experience with hot module replacement
- ✅ **TypeScript**: Type safety and better developer experience

## 🌍 Internationalization

This project supports multiple languages:

- **English** (en) - Default
- **Czech** (cs) - Čeština  
- **Russian** (ru) - Русский

### Language Features

- 🔄 **Auto-detection**: Browser language detection with fallback
- 💾 **Persistence**: Language preference saved to localStorage
- 🎛️ **Language Selector**: Easy language switching in the navigation
- 📱 **Mobile Support**: Language selector works on all screen sizes

### Adding New Languages

1. Add the locale to `wuchale.config.js`
2. Run `pnpm extract` to generate translation files
3. Translate the strings in the generated `.po` files
3. Update the language selector in `src/lib/components/LanguageSelector.svelte`

<br><br>

## 🎯 Getting Started

1. Clone the repository:

```sh
git clone https://github.com/jhordyess/svelte-tailwind-darkmode.git
```

2. Navigate to the project folder:

```sh
cd svelte-tailwind-darkmode
```

3. Install dependencies:

```sh
pnpm install
```

4. Start the development server:

```sh
pnpm run dev
```

5. Open your browser and visit [http://localhost:5173](http://localhost:5173) to see your project.

<br><br>

# 📌 Project structure

```md
├── src
│   ├── lib
│   │   ├── components
│   │   │   ├── ui
│   │   │   │   ├── button
│   │   │   │   │   ├── button.svelte
│   │   │   │   │   └── index.ts
│   │   │   │   └── dropdown-menu
│   │   │   │   ├── dropdown-menu-checkbox-item.svelte
│   │   │   │   ├── dropdown-menu-content.svelte
│   │   │   │   ├── dropdown-menu-item.svelte
│   │   │   │   ├── dropdown-menu-label.svelte
│   │   │   │   ├── dropdown-menu-radio-group.svelte
│   │   │   │   ├── dropdown-menu-radio-item.svelte
│   │   │   │   ├── dropdown-menu-separator.svelte
│   │   │   │   ├── dropdown-menu-shortcut.svelte
│   │   │   │   ├── dropdown-menu-sub-content.svelte
│   │   │   │   ├── dropdown-menu-sub-trigger.svelte
│   │   │   │   └── index.ts
│   │   │   └── ThemeToggle.svelte
│   │   ├── index.ts
│   │   └── utils.ts
│   ├── routes
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   ├── styles
│   │   └── app.css
│   ├── app.d.ts
│   └── app.html
├── static
│   └── favicon-32x32.png
├── README.md
├── components.json
├── eslint.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── svelte.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

<br><br>

## 🎯 Commands

### Start the development server

```sh
pnpm run dev
```

### Build the project for production

```sh
pnpm run build
```

### Preview the project before production

```sh
pnpm run preview
```

## 🎯 Contributing

Contributions are welcome! If you find any issues or want to enhance the project, feel free to submit a pull request.

---

Happy coding!
