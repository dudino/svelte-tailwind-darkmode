<!--
  Admin Layout
  Protected layout for administrator-only pages
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentUser, isAuthenticated, userRole, logout } from '$lib/stores/authStore';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Shield, AlertTriangle } from 'lucide-svelte';

  let { children } = $props();
  let loading = $state(true);
  let hasAccess = $state(false);

  function handleLogout() {
    logout();
  }

  onMount(async () => {
    // Wait a bit for auth store to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!$isAuthenticated) {
      goto(`/login?redirect=${encodeURIComponent($page.url.pathname)}`);
      return;
    }

    if ($userRole !== 'administrator' && $userRole !== 'operator') {
      // Non-administrators and non-operators get redirected to home
      goto('/');
      return;
    }

    hasAccess = true;
    loading = false;
  });

  // Reactive check for authentication and role changes
  $effect(() => {
    if (!loading) {
      if (!$isAuthenticated) {
        goto(`/login?redirect=${encodeURIComponent($page.url.pathname)}`);
      } else if ($userRole !== 'administrator' && $userRole !== 'operator') {
        goto('/');
      }
    }
  });
</script>

{#if loading}
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="text-muted-foreground">Verifying access...</p>
    </div>
  </div>
{:else if hasAccess && $isAuthenticated && ($userRole === 'administrator' || $userRole === 'operator')}
  <div class="admin-layout">
    <div class="admin-header mt-16 bg-gradient-to-r from-primary/20 to-primary/10 border-b mb-6 p-4 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield class="h-6 w-6" />
            {$userRole === 'administrator' ? 'Administrator Panel' : 'Management Panel'}
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Manage your application settings, users, and system configuration
          </p>
          <p class="text-muted-foreground mt-2">
            Logged in as: <span class="font-bold">{$currentUser?.name || 'Administrator'}</span>
            <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2">
              {$userRole}
            </span>
          </p>
        </div>
        <Button on:click={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </div>

    {@render children?.()}
  </div>
{:else}
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4 max-w-md">
      <div class="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle class="h-8 w-8 text-destructive" />
      </div>
      <h2 class="text-2xl font-bold text-destructive">Access Denied</h2>
      <p class="text-muted-foreground">
        You need administrator privileges to access this area.
      </p>
      <div class="flex gap-4 justify-center">
        <Button href="/login" variant="default">
          Login
        </Button>
        <Button href="/" variant="outline">
          Return Home
        </Button>
      </div>
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
