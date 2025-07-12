<script>
    import LanguageSelector from '$lib/components/LanguageSelector.svelte';
    
    // Get the locale from the parent layout data
    let { data } = $props();
    let currentLocale = $derived(data?.locale || 'en');
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Wuchale Internationalization Demo</h1>
        <LanguageSelector />
    </div>
    
    <div class="grid gap-8 md:grid-cols-2">
        <div class="card p-6 bg-card rounded-lg">
            <h2 class="text-2xl font-semibold mb-4">Welcome to Our Spa</h2>
            <p class="mb-4">Experience the ultimate relaxation and wellness journey.</p>
            
            <div class="grid gap-4 mt-6">
                <div class="p-4 border rounded">
                    <h3 class="font-medium">Professional Massage</h3>
                    <p class="text-sm">Our certified therapists provide the best massage experience.</p>
                </div>
                
                <div class="p-4 border rounded">
                    <h3 class="font-medium">Relaxing Environment</h3>
                    <p class="text-sm">Enjoy our peaceful and tranquil atmosphere.</p>
                </div>
                
                <div class="p-4 border rounded">
                    <h3 class="font-medium">Premium Services</h3>
                    <p class="text-sm">We offer a wide range of premium wellness services.</p>
                </div>
            </div>
            
            <div class="mt-6 flex gap-4">
                <button class="btn bg-primary text-primary-foreground px-4 py-2 rounded">
                    Book Now
                </button>
                <button class="btn bg-secondary text-secondary-foreground px-4 py-2 rounded">
                    Learn More
                </button>
            </div>
        </div>
        
        <div class="space-y-6">
            <div class="card p-6 bg-card rounded-lg">
                <h2 class="text-2xl font-semibold mb-4">How Wuchale Works</h2>
                <p>Wuchale extracts strings from your components automatically based on:</p>
                <ul class="list-disc pl-5 space-y-2 mt-4">
                    <li>Markup text (auto-extracted)</li>
                    <li>Capitalized attribute text</li>
                    <li>Strings in $derived statements</li>
                </ul>
                
                <div class="mt-6 p-4 bg-muted rounded text-sm font-mono">
                    <p>&lt;h1&gt;Welcome&lt;/h1&gt; <span class="text-green-500">// ✓ extracted</span></p>
                    <p>&lt;p&gt;hello world&lt;/p&gt; <span class="text-red-500">// ✗ lowercase start</span></p>
                    <p>&lt;img alt="Profile" /&gt; <span class="text-green-500">// ✓ capital attribute</span></p>
                </div>
            </div>
            
            <div class="card p-6 bg-card rounded-lg">
                <h2 class="text-2xl font-semibold mb-4">Current Language</h2>
                <div class="flex items-center space-x-4">
                    <div class="p-3 bg-muted rounded-full">
                        {#if currentLocale === 'en'}
                            <span class="text-2xl">🇺🇸</span>
                        {:else if currentLocale === 'cs'}
                            <span class="text-2xl">🇨🇿</span>
                        {:else if currentLocale === 'ru'}
                            <span class="text-2xl">🇷🇺</span>
                        {/if}
                    </div>
                    <div>
                        <p class="font-medium">
                            {#if currentLocale === 'en'}
                                English
                            {:else if currentLocale === 'cs'}
                                Čeština
                            {:else if currentLocale === 'ru'}
                                Русский
                            {/if}
                        </p>
                        <p class="text-sm text-muted-foreground">Locale code: {currentLocale}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
