// @ts-check
import { defineConfig } from "wuchale"

export default defineConfig({
        sourceLocale: 'en',

    locales: {
        en: { name: 'English' },
        cs: { name: 'Czech' },
        ru: { name: 'Russian' }
    },
    // Configure the directory where translations are stored
    localesDir: './src/locales',
     files: ['./src/**/*.svelte', './src/**/*.svelte.{js,ts}'],
    hmr: true,
    // Enable Gemini AI auto-translation
    // Set to 'env' to use GEMINI_API_KEY environment variable
    geminiAPIKey: 'env'
})
