<!--
  Admin Layout
  Protected layout for administrator-only pages
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { currentUser, isAuthenticated } from '$lib/stores';
  import { hasRole } from '$lib/stores/authStore';

  let { children } = $props();

  onMount(() => {
    // Check if user is authenticated and has administrator role
    if (!$isAuthenticated || !hasRole('administrator')) {
      goto('/login');
      return;
    }
  });

  // Reactive check for authentication and role
  $effect(() => {
    if (!$isAuthenticated || !hasRole('administrator')) {
      goto('/login');
    }
  });
</script>

<!-- Only render admin content if user is authenticated and is an administrator -->
{#if $isAuthenticated && hasRole('administrator')}
  <div class="admin-layout">
    <div class="admin-header bg-gradient-to-r from-primary/20 to-primary/10 border-b mb-6 p-4 rounded-lg">
      <h1 class="text-2xl font-bold text-primary flex items-center gap-2">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        Administrator Panel
      </h1>
      <p class="text-muted-foreground mt-1">Manage all system entities and configurations</p>
    </div>

    {@render children()}
  </div>
{:else}
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center">
      <div class="text-destructive text-6xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
      <p class="text-muted-foreground mb-4">You need administrator privileges to access this area.</p>
      <a href="/" class="text-primary hover:underline">Return to Home</a>
    </div>
  </div>
{/if}

<style>
  .admin-layout {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }
</style>
