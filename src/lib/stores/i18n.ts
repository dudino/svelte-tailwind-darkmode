import { writable, derived } from 'svelte/store';
import { locale } from 'svelte-i18n';

// Create a force refresh store that we can trigger manually
export const forceRefresh = writable(0);

// Create a derived store that combines locale and force refresh
export const reactiveLocale = derived(
  [locale, forceRefresh],
  ([$locale, $forceRefresh]) => {
    console.log('Reactive locale update:', $locale, 'refresh:', $forceRefresh);
    return { locale: $locale, refresh: $forceRefresh };
  }
);

// Function to force refresh translations
export function refreshTranslations() {
  forceRefresh.update(n => n + 1);
  console.log('Forced translation refresh');
}
