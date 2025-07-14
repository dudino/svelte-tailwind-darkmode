<!--
  Empty state component for when no data is available - usable across all pages
-->
<script lang="ts">
  import { FileX, Plus } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  export let title = 'No items found';
  export let description = 'There are no items to display at the moment.';
  export let actionText = '';
  export let onAction: (() => void) | null = null;
  export let icon = FileX;
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
  <svelte:component this={icon} class="h-12 w-12 text-muted-foreground mb-4" />
  
  <h3 class="text-lg font-semibold mb-2">{title}</h3>
  
  <p class="text-muted-foreground mb-6 max-w-sm">
    {description}
  </p>

  {#if actionText && onAction}
    <Button on:click={onAction}>
      <Plus class="h-4 w-4 mr-2" />
      {actionText}
    </Button>
  {/if}

  <slot />
</div>
