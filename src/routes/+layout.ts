import { setTranslations } from 'wuchale/runtime.svelte.js'

export async function load({ url }) {
    // Get locale from URL parameter or default to 'en'
    const locale = url.searchParams.get('locale') ?? 'en'
    
    // Load translations for the locale
    try {
        const translations = await import(`../locales/${locale}.svelte.js`)
        setTranslations(translations)
    } catch (error) {
        // Fallback to English if locale not found
        console.warn(`Locale ${locale} not found, falling back to English`)
        const translations = await import(`../locales/en.svelte.js`)
        setTranslations(translations)
    }
    
    return { locale }
}

export const prerender = false;
export const ssr = false;
