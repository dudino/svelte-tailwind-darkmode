import { browser } from '$app/environment';
import { init, register, locale, getLocaleFromNavigator, isLoading } from 'svelte-i18n';

const defaultLocale = 'en';
const supportedLocales = ['en', 'cs', 'ru'];

// Register all locales
register('en', () => import('./locales/en.json'));
register('cs', () => import('./locales/cs.json'));
register('ru', () => import('./locales/ru.json'));

function getInitialLocale() {
	if (!browser) return defaultLocale;
	
	// Check for saved language preference first
	const savedLanguage = localStorage.getItem('preferred-language');
	if (savedLanguage && supportedLocales.includes(savedLanguage)) {
		console.log('Using saved language:', savedLanguage);
		return savedLanguage;
	}
	
	// Fall back to browser language
	const browserLanguage = getLocaleFromNavigator() || defaultLocale;
	console.log('Browser language:', browserLanguage);
	
	// Map browser languages to supported locales
	if (browserLanguage.startsWith('cs')) return 'cs';
	if (browserLanguage.startsWith('ru')) return 'ru';
	if (browserLanguage.startsWith('en')) return 'en';
	
	return defaultLocale;
}

const initialLocale = getInitialLocale();
console.log('Initializing i18n with locale:', initialLocale);

init({
	fallbackLocale: defaultLocale,
	initialLocale: initialLocale,
	loadingDelay: 200,
	warnOnMissingMessages: true,
});

// Listen for locale changes and save to localStorage
if (browser) {
	locale.subscribe((currentLocale) => {
		if (currentLocale && supportedLocales.includes(currentLocale)) {
			localStorage.setItem('preferred-language', currentLocale);
			console.log('Locale changed to:', currentLocale);
		}
	});
}
