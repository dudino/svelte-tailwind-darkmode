import { browser } from '$app/environment';
import { init, register, locale } from 'svelte-i18n';

const defaultLocale = 'en';

register('en', () => import('./locales/en.json'));
register('cs', () => import('./locales/cs.json'));
register('ru', () => import('./locales/ru.json'));

function getInitialLocale() {
	if (!browser) return defaultLocale;
	
	// Check for saved language preference first
	const savedLanguage = localStorage.getItem('preferred-language');
	if (savedLanguage && ['en', 'cs', 'ru'].includes(savedLanguage)) {
		return savedLanguage;
	}
	
	// Fall back to browser language
	const browserLanguage = window.navigator.language.toLowerCase();
	
	// Map browser languages to supported locales
	if (browserLanguage.startsWith('cs')) return 'cs';
	if (browserLanguage.startsWith('ru')) return 'ru';
	if (browserLanguage.startsWith('en')) return 'en';
	
	return defaultLocale;
}

init({
	fallbackLocale: defaultLocale,
	initialLocale: getInitialLocale(),
});

// Set the initial locale immediately
locale.set(getInitialLocale());
