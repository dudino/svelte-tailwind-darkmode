<!--
  Search and filter component - reusable across all data pages
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, Filter, X } from 'lucide-svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  const dispatch = createEventDispatcher();

  export let searchValue = '';
  export let placeholder = 'Search...';
  export let showFilters = false;
  export let hasActiveFilters = false;

  function handleSearch() {
    dispatch('search', { query: searchValue });
  }

  function handleClearSearch() {
    searchValue = '';
    dispatch('search', { query: '' });
  }

  function toggleFilters() {
    showFilters = !showFilters;
    dispatch('toggleFilters', { show: showFilters });
  }

  function clearFilters() {
    dispatch('clearFilters');
  }
</script>

<div class="space-y-4">
  <!-- Search Bar -->
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        bind:value={searchValue}
        {placeholder}
        class="pl-10 pr-10"
        on:input={handleSearch}
        on:keydown={(e) => e.key === 'Enter' && handleSearch()}
      />
      {#if searchValue}
        <button
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          on:click={handleClearSearch}
        >
          <X class="h-4 w-4" />
        </button>
      {/if}
    </div>

    <Button variant="outline" on:click={toggleFilters}>
      <Filter class="h-4 w-4 mr-2" />
      Filters
      {#if hasActiveFilters}
        <span class="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
          Active
        </span>
      {/if}
    </Button>

    {#if hasActiveFilters}
      <Button variant="ghost" size="sm" on:click={clearFilters}>
        Clear filters
      </Button>
    {/if}
  </div>

  <!-- Filter Panel -->
  {#if showFilters}
    <div class="border rounded-lg p-4 bg-muted/30">
      <slot name="filters" />
    </div>
  {/if}
</div>
