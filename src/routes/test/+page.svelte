<script>
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	export let data;
</script>

<svelte:head>
	<title>Wuchale Test</title>
</svelte:head>

<div class="container mx-auto p-4">
	<LanguageSwitcher currentLocale={data?.locale || 'en'} />
	
	<h1>Welcome to our store!</h1>
	<p>Hello there, you have items in your cart.</p>

	<div>
		<h2>About Us</h2>
		<p>We provide the best service.</p>
		<button>Get Started</button>
	</div>

	<footer>
		<p>Contact us for more information.</p>
	</footer>
</div>
