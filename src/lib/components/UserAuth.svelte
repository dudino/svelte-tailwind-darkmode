<!--
  User Authentication Component
  Handles login form only
-->

<script lang="ts">
  import { 
    isLoading, 
    login
  } from '$lib/stores';

  // Form states
  let showLoginForm = false;

  // Form data
  let loginForm = {
    email: '',
    password: ''
  };

  // Authentication functions
  async function handleLogin() {
    const success = await login(loginForm.email, loginForm.password);
    if (success) {
      showLoginForm = false;
      loginForm = { email: '', password: '' };
    }
  }
</script>

<div class="max-w-2xl mx-auto">
  <div class="bg-background border-2 border-border rounded-2xl shadow-2xl backdrop-blur-md p-8">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
      <p class="text-muted-foreground">Please sign in to access the user management system</p>
    </div>
    
    <div class="flex gap-4 justify-center mb-6">
      <button 
        onclick={() => showLoginForm = !showLoginForm}
        class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login
      </button>
    </div>

    <!-- Login Form -->
    {#if showLoginForm}
      <div class="mt-6 p-6 bg-card border-2 border-border rounded-xl shadow-xl backdrop-blur-sm">
        <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </h3>
        <div class="space-y-4">
          <div>
            <label for="login-email" class="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <input 
              id="login-email"
              bind:value={loginForm.email}
              type="email" 
              placeholder="Enter your email"
              class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
          </div>
          
          <div>
            <label for="login-password" class="block text-sm font-medium text-foreground mb-2">Password</label>
            <input 
              id="login-password"
              bind:value={loginForm.password}
              type="password" 
              placeholder="Enter your password"
              class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
          </div>
          
          <button 
            onclick={handleLogin}
            disabled={$isLoading}
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium">
            {$isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
