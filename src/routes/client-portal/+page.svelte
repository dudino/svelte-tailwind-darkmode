<script>
	import ClientPortal from '$lib/components/ClientPortal.svelte';
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('pageTitles.clientPortalAffinity')}</title>
	<meta name="description" content="{$_('meta.clientPortalDescription')}" />
</svelte:head>

<ClientPortal />
