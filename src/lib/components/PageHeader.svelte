<!--
  Page header component - reusable across all pages with title, description, and actions
-->
<script lang="ts">
  export let title = '';
  export let description = '';
  export let icon: any = null;
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <div class="flex items-center gap-3 mb-2">
      {#if icon}
        <svelte:component this={icon} class="h-8 w-8 text-primary" />
      {/if}
      <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
    </div>
    {#if description}
      <p class="text-muted-foreground">{description}</p>
    {/if}
  </div>
  
  <div class="flex items-center gap-2">
    <slot name="actions" />
  </div>
</div>
