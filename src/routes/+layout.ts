import { setTranslations } from 'wuchale/runtime.svelte.js'

// Available locales
const AVAILABLE_LOCALES = ['en', 'cs', 'ru'];

export async function load({ url }: { url: URL }) {
    // Get locale from URL parameter or default to 'en'
    let locale = url.searchParams.get('locale') ?? 'en';
    
    // Ensure the locale is available
    if (!AVAILABLE_LOCALES.includes(locale)) {
        locale = 'en';
    }
    
    // Load translations for the locale
    try {
        const translations = await import(`../locales/${locale}.svelte.js`);
        setTranslations(translations);
    } catch (error) {
        // Fallback to English if locale not found
        console.warn(`Locale ${locale} not found, falling back to English`);
        try {
            const translations = await import(`../locales/en.svelte.js`);
            setTranslations(translations);
            locale = 'en';
        } catch (fallbackError) {
            console.error('Failed to load default locale:', fallbackError);
            // Set empty translations as last resort
            setTranslations({});
        }
    }
    
    return { locale }
}

export const prerender = false;
export const ssr = false;
