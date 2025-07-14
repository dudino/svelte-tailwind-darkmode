<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentUser, isAuthenticated, userRole, logout } from '$lib/stores';
  import MobileNavbar from '$lib/components/MobileNavbar.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Loader2, Shield } from 'lucide-svelte';

  let authCheckComplete = false;

  function handleLogout() {
    logout();
  }

  onMount(() => {
    // Simple one-time auth check
    const checkAuth = () => {
      if (!$isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        goto('/login');
        return;
      }

      if (!$currentUser) {
        console.log('No user data yet, waiting...');
        // Wait for user data to load
        setTimeout(checkAuth, 100);
        return;
      }

      console.log('Operator layout: checking access for user role:', $currentUser.role);
      
      if (!['operator', 'administrator'].includes($currentUser.role)) {
        console.log('Access denied for role:', $currentUser.role, 'redirecting to home');
        goto('/');
        return;
      }

      console.log('Access granted for operator/administrator role');
      authCheckComplete = true;
    };

    checkAuth();
  });
</script>

{#if authCheckComplete}
  <div class="min-h-screen">
    <MobileNavbar />
    <div class="admin-layout">
      <div class="admin-header mt-16 bg-gradient-to-r from-primary/20 to-primary/10 border-b mb-6 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-primary flex items-center gap-2">
              <Shield class="h-6 w-6" />
              {$userRole === 'administrator' ? 'Administrator Panel' : 'Operator Panel'}
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              Manage your operations, bookings, and client services
            </p>
            <p class="text-muted-foreground mt-2">
              Logged in as: <span class="font-bold">{$currentUser?.name || 'Operator'}</span>
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
      <slot />
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex items-center space-x-2">
      <Loader2 class="h-4 w-4 animate-spin" />
      <span>Loading...</span>
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


