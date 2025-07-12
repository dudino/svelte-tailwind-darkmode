// UPDATED: Test script for direct translation approach
// Paste this in browser console to test the new aggressive fix

console.log('🔧 Testing DIRECT translation approach...');

// Test 1: Check if direct translations are working
console.log('Testing direct translation access...');

// Test 2: Force refresh function test
function testDirectTranslations() {
    console.log('🌍 Testing direct translation functions...');
    
    // Check if our custom event dispatch works
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: 'cs' }));
    
    setTimeout(() => {
        console.log('Check if UI updated to Czech');
        
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: 'ru' }));
        
        setTimeout(() => {
            console.log('Check if UI updated to Russian');
            
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: 'en' }));
            
            setTimeout(() => {
                console.log('Check if UI updated to English');
            }, 2000);
        }, 2000);
    }, 2000);
}

// Test 3: Manual storage and refresh test
function aggressiveLanguageTest(locale) {
    console.log(`🚀 AGGRESSIVE test for locale: ${locale}`);
    
    // Set everything manually
    localStorage.setItem('preferred-language', locale);
    
    // Dispatch multiple events
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: locale }));
    
    // Try to trigger svelte reactivity
    document.dispatchEvent(new CustomEvent('localechange', { detail: locale }));
    
    // Force a component update
    const event = new CustomEvent('forceupdate', { detail: { locale, timestamp: Date.now() } });
    window.dispatchEvent(event);
    
    console.log(`Set language to ${locale}, check UI now!`);
}

console.log('🎯 Available test functions:');
console.log('- testDirectTranslations() - Test event dispatching');
console.log('- aggressiveLanguageTest("cs") - Aggressive Czech test');
console.log('- aggressiveLanguageTest("ru") - Aggressive Russian test');
console.log('- aggressiveLanguageTest("en") - Aggressive English test');

// Auto-run test
console.log('🚀 Auto-testing in 3 seconds...');
setTimeout(() => {
    testDirectTranslations();
}, 3000);
