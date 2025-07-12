# Internationalization with Wuchale

This project uses [Wuchale](https://github.com/K1DV5/wuchale) for internationalization (i18n).

## Features

- Zero-effort integration - Write your Svelte code naturally
- Compile-time optimization - Minimal runtime overhead
- Smart string extraction - Automatically detects translatable text
- Support for English, Czech, and Russian

## How to Use

### Switching Languages

The app supports three languages:
- English (en)
- Czech (cs)
- Russian (ru)

You can switch languages by:
1. Using the language selector in the UI
2. Adding `?locale=CODE` to the URL (e.g., `?locale=cs` for Czech)

### Demo Page

Visit `/i18n-demo` to see a demonstration of the internationalization features.

## For Developers

### Translation Files

Translations are stored in the `src/locales` directory:
- `en.po` - English (source language)
- `cs.po` - Czech translations
- `ru.po` - Russian translations

The compiled `.svelte.js` files are generated automatically and should not be edited manually.

### Adding New Strings

Just write your Svelte code normally. Text nodes will be automatically extracted for translation if:

- In markup: All text content is extracted
- In attributes: Attributes starting with an uppercase letter are extracted
- In script: Capitalized strings are extracted in certain contexts

Example:
```svelte
<h1>Welcome</h1> <!-- Extracted -->
<p>hello world</p> <!-- Not extracted (lowercase) -->
<img alt="Profile" /> <!-- Extracted (uppercase) -->
```

### Commands

- `pnpm extract` - Extract new strings and update translation files
- `pnpm clean` - Clean the translation cache

### Special Annotations

- `<!-- @wc-ignore -->` - Skip extraction for a node
- `/* @wc-include */` - Force extraction of a string
- `<!-- @wc-context: name -->` - Add context to disambiguate identical text

## More Information

For more details, check the [Wuchale documentation](https://github.com/K1DV5/wuchale).
