<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let currentLocale = 'en';

	const locales = [
		{ code: 'en', name: 'English' },
		{ code: 'cs', name: 'Čeština' },
		{ code: 'ru', name: 'Русский' }
	];

	function switchLocale(locale) {
		const url = new URL($page.url);
		url.searchParams.set('locale', locale);
		goto(url.toString());
	}
</script>

<div class="flex items-center gap-2 p-2">
	<span class="text-sm font-medium">Language:</span>
	<select 
		value={currentLocale} 
		on:change={(e) => switchLocale(e.target.value)}
		class="text-sm border rounded px-2 py-1"
	>
		{#each locales as locale}
			<option value={locale.code}>{locale.name}</option>
		{/each}
	</select>
</div>
