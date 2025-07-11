// Quick test script for PWA cache clearing and i18n fix
// Paste this in browser console to test language switching

console.log('🔧 Testing PWA cache clearing and i18n fix...');

// Test 1: Check current cache
caches.keys().then(cacheNames => {
    console.log('Current caches:', cacheNames);
});

// Test 2: Clear all affinity caches
async function clearAffinityCaches() {
    const cacheNames = await caches.keys();
    const affinityCaches = cacheNames.filter(name => name.includes('affinity'));
    
    console.log('Clearing affinity caches:', affinityCaches);
    
    await Promise.all(affinityCaches.map(name => caches.delete(name)));
    console.log('✅ All affinity caches cleared');
    
    // Force a hard reload
    window.location.reload(true);
}

// Test 3: Manual language change with cache clear
async function testLanguageChange(locale) {
    console.log(`🌍 Testing language change to: ${locale}`);
    
    // Clear caches first
    await clearAffinityCaches();
    
    // Set language
    localStorage.setItem('preferred-language', locale);
    
    // Reload page
    window.location.reload();
}

console.log('Available test functions:');
console.log('- clearAffinityCaches() - Clear all PWA caches');
console.log('- testLanguageChange("cs") - Test Czech');
console.log('- testLanguageChange("ru") - Test Russian');
console.log('- testLanguageChange("en") - Test English');

// Auto-clear cache and test
console.log('🚀 Auto-clearing cache in 3 seconds...');
setTimeout(() => {
    clearAffinityCaches();
}, 3000);
