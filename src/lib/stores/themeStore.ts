/**
 * Theme Store
 * Manages application theme and UI preferences
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Theme stores
export const theme = writable<'light' | 'dark'>('light');

/**
 * Initialize theme from localStorage
 */
export function initTheme() {
  if (!browser) return;
  
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme.set(savedTheme);
    }
  } catch (err) {
    console.warn('Failed to load theme from localStorage:', err);
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
  theme.update(currentTheme => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (browser) {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (err) {
        console.warn('Failed to save theme to localStorage:', err);
      }
    }
    
    return newTheme;
  });
}

/**
 * Set specific theme
 */
export function setTheme(newTheme: 'light' | 'dark') {
  theme.set(newTheme);
  
  if (browser) {
    try {
      localStorage.setItem('theme', newTheme);
    } catch (err) {
      console.warn('Failed to save theme to localStorage:', err);
    }
  }
}

// Initialize theme on module load
if (browser) {
  initTheme();
}
