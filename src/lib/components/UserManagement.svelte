<!--
  User Management Component
  Demonstrates user authentication and CRUD operations
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    currentUser, 
    isAuthenticated, 
    users, 
    isLoading, 
    error,
    login, 
    register, 
    logout,
    updateUser,
    deleteUser,
    syncData,
    loadUsersFromStorage,
    selectUser,
    selectedUser
  } from '$lib/stores';
  import type { CreateUserData, UpdateUserData, UserRole } from '$lib/types/user';
  import { AVAILABLE_LANGUAGES, AVAILABLE_SERVICES } from '$lib/types/user';

  // Form states
  let showLoginForm = false;
  let showRegisterForm = false;
  let showUserForm = false;
  let editingUser: any = null;

  // Form data
  let loginForm = {
    email: '',
    password: ''
  };

  let registerForm: CreateUserData = {
    email: '',
    name: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    role: 'user' as UserRole,
    is_active: true,
    has_accommodation: false,
    languages: [],
    services: [],
    contact_details: {}
  };

  // Search and filter
  let searchQuery = '';
  let roleFilter: UserRole | 'all' = 'all';
  let statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Computed values
  $: filteredUsers = $users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchLower) ||
                         (user.email?.toLowerCase() || '').includes(searchLower) ||
                         (user.phone?.toLowerCase() || '').includes(searchLower) ||
                         // Backwards compatibility with old field names
                         (user.nickname?.toLowerCase() || '').includes(searchLower);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // Check status filter
    const userStatus = user.is_active ?? user.isActive ?? true;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && userStatus) ||
                         (statusFilter === 'inactive' && !userStatus);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  onMount(() => {
    loadUsersFromStorage();
    
    // If user is authenticated, automatically sync data from server
    if ($isAuthenticated) {
      syncData();
    }
  });

  // Authentication functions
  async function handleLogin() {
    const success = await login(loginForm.email, loginForm.password);
    if (success) {
      showLoginForm = false;
      loginForm = { email: '', password: '' };
    }
  }

  async function handleRegister() {
    if (registerForm.password !== registerForm.passwordConfirm) {
      error.set('Passwords do not match');
      return;
    }

    const newUser = await register(registerForm);
    if (newUser) {
      showRegisterForm = false;
      resetRegisterForm();
    }
  }

  function resetRegisterForm() {
    registerForm = {
      email: '',
      name: '',
      phone: '',
      password: '',
      passwordConfirm: '',
      role: 'user',
      is_active: true,
      has_accommodation: false,
      languages: [],
      services: [],
      contact_details: {}
    };
  }

  // User management functions
  function editUser(user: any) {
    editingUser = { 
      ...user,
      // Ensure contactDetails is properly initialized
      contactDetails: user.contactDetails || user.contact_details || {},
      // Ensure other fields have defaults
      languages: user.languages || [],
      services: user.services || []
    };
    showUserForm = true;
  }

  async function handleUserUpdate() {
    if (!editingUser) return;

    const updateData: UpdateUserData = {
      name: editingUser.name,
      phone: editingUser.phone,
      role: editingUser.role,
      is_active: editingUser.is_active,
      has_accommodation: editingUser.has_accommodation,
      languages: editingUser.languages,
      services: editingUser.services,
      contact_details: editingUser.contact_details,
      // Backwards compatibility
      nickname: editingUser.name, // map name to nickname for backwards compatibility
      isActive: editingUser.is_active,
      hasAccommodation: editingUser.has_accommodation,
      contactDetails: editingUser.contact_details
    };

    const updatedData = await updateUser(editingUser.id, updateData);
    if (updatedData) {
      showUserForm = false;
      editingUser = null;
    }
  }

  async function handleUserStatusToggle(userId: string) {
    // Find the user to toggle
    const user = $users.find(u => u.id === userId);
    if (!user) return;
    
    const currentStatus = user.is_active ?? user.isActive ?? true;
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to ${action} this user?`)) {
      // Update the user's active status
      const updateData = {
        is_active: newStatus,
        isActive: newStatus // backwards compatibility
      };
      
      const result = await updateUser(userId, updateData);
      
      // Show user feedback based on result
      if (result && result.success !== false) {
        console.log(`User ${action}d successfully`);
      } else {
        alert(`Failed to ${action} user. Please try again.`);
      }
    }
  }

  // Utility functions
  function toggleLanguage(language: string) {
    if (editingUser) {
      const languages = editingUser.languages || [];
      if (languages.includes(language)) {
        editingUser.languages = languages.filter((l: string) => l !== language);
      } else {
        editingUser.languages = [...languages, language];
      }
    }
  }

  function toggleService(service: string) {
    if (editingUser) {
      const services = editingUser.services || [];
      if (services.includes(service)) {
        editingUser.services = services.filter((s: string) => s !== service);
      } else {
        editingUser.services = [...services, service];
      }
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-muted/40 via-muted/60 to-primary/20 dark:from-muted/60 dark:via-muted/80 dark:to-primary/30">
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
          User Management System
        </h1>
      <p class="text-muted-foreground text-lg">Manage users, roles, and permissions</p>
    </div>
  </div>

  <!-- Error Display -->
  {#if $error}
    <div class="mb-6 p-4 bg-background border-2 border-destructive/40 text-destructive rounded-xl backdrop-blur-md shadow-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">{$error}</span>
        </div>
        <button onclick={() => error.set('')} class="text-destructive hover:text-destructive/80 font-bold text-xl transition-colors">×</button>
      </div>
    </div>
  {/if}

  <!-- Authentication Section -->
  {#if !$isAuthenticated}
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
          
          <button 
            onclick={() => showRegisterForm = !showRegisterForm}
            class="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all shadow-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register
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

      <!-- Register Form -->
      {#if showRegisterForm}
        <div class="mt-6 p-6 bg-card border-2 border-border rounded-xl shadow-xl backdrop-blur-sm">
          <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register New User
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="register-name" class="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <input 
                  id="register-name"
                  bind:value={registerForm.name}
                  placeholder="Enter full name"
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
              
              <div>
                <label for="register-email" class="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                <input 
                  id="register-email"
                  bind:value={registerForm.email}
                  type="email" 
                  placeholder="Enter email address"
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
              
              <div>
                <label for="register-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <input 
                  id="register-phone"
                  bind:value={registerForm.phone}
                  placeholder="Enter phone number"
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
              
              <div>
                <label for="register-role" class="block text-sm font-medium text-foreground mb-2">User Role</label>
                <select 
                  id="register-role"
                  bind:value={registerForm.role} 
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
                  <option value="user">User</option>
                  <option value="operator">Operator</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
              
              <div>
                <label for="register-password" class="block text-sm font-medium text-foreground mb-2">Password *</label>
                <input 
                  id="register-password"
                  bind:value={registerForm.password}
                  type="password" 
                  placeholder="Enter password"
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
              
              <div>
                <label for="register-password-confirm" class="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
                <input 
                  id="register-password-confirm"
                  bind:value={registerForm.passwordConfirm}
                  type="password" 
                  placeholder="Confirm password"
                  class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
            </div>
            
            <div class="flex flex-wrap gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  bind:checked={registerForm.is_active}
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Active User</span>
              </label>
              
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  bind:checked={registerForm.has_accommodation}
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Has Accommodation</span>
              </label>
            </div>
            
            <button 
              onclick={handleRegister}
              disabled={$isLoading}
              class="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium">
              {$isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
  {:else}
    <!-- User Dashboard -->
   

    <div class="bg-background border-2 border-border rounded-xl shadow-2xl backdrop-blur-md p-6">
                <h2 class="text-xl text-center mb-12 font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome, {$currentUser?.name}
          </h2>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          User Management
        </h2>
        
        <div class="flex gap-3">
          <button 
            onclick={() => syncData()}
            disabled={$isLoading}
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Data
          </button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1">
          <label for="search-users" class="block text-sm font-medium text-foreground mb-2">Search Users</label>
          <input 
            id="search-users"
            bind:value={searchQuery}
            placeholder="Search by name, email, or phone..."
            class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground">
        </div>
        
        <div class="min-w-[150px]">
          <label for="filter-role" class="block text-sm font-medium text-foreground mb-2">Filter by Role</label>
          <select 
            id="filter-role"
            bind:value={roleFilter} 
            class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="operator">Operators</option>
            <option value="administrator">Administrators</option>
          </select>
        </div>
        
        <div class="min-w-[150px]">
          <label for="filter-status" class="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
          <select 
            id="filter-status"
            bind:value={statusFilter} 
            class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <!-- Users List -->
      <div class="space-y-3">
        {#each filteredUsers as user (user.id)}
          {@const isActive = user.is_active ?? user.isActive ?? true}
          <div class="border-2 border-border rounded-xl p-6 flex justify-between items-start transition-all bg-background shadow-xl hover:shadow-2xl backdrop-blur-sm {!isActive ? 'opacity-70 border-destructive/40' : ''}">>
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="font-semibold text-foreground" class:text-muted-foreground={!isActive}>
                  {user.name || user.nickname || 'Unnamed'}
                </h3>
                
                <!-- Role Badge -->
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  {user.role === 'administrator' && isActive
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    : user.role === 'operator' && isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    : user.role === 'user' && isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-muted text-muted-foreground'}">
                  {user.role}
                </span>
                
                <!-- Status Badge -->
                {#if !isActive}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                    </svg>
                    Inactive
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Active
                  </span>
                {/if}
                
                <!-- Sync Pending Badge -->
                {#if user.syncPending}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                    <svg class="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Pending
                  </span>
                {/if}
              </div>
              
              <div class="text-sm text-muted-foreground">
                <p class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {user.email}
                </p>
                {#if user.phone}
                  <p class="flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.phone}
                  </p>
                {/if}
                {#if user.languages && user.languages.length > 0}
                  <p class="flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Languages: {user.languages.join(', ')}
                  </p>
                {/if}
                {#if user.last_login_at}
                  <p class="flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last login: {new Date(user.last_login_at).toLocaleString()}
                  </p>
                {/if}
              </div>
            </div>
            
            <div class="flex gap-2 ml-4">
              <button 
                onclick={() => editUser(user)}
                class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all shadow-sm font-medium flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              
              {#if $currentUser?.role === 'administrator' && user.id !== $currentUser?.id}
                {@const isActive = user.is_active ?? user.isActive ?? true}
                <button 
                  onclick={() => handleUserStatusToggle(user.id)}
                  class="px-4 py-2 rounded-lg transition-all shadow-sm font-medium flex items-center gap-2
                    {isActive 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'}">
                  {#if isActive}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                    </svg>
                    Deactivate
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Activate
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        {/each}
        
        {#if filteredUsers.length === 0}
          <div class="text-center py-8 text-gray-500">
            No users found matching your criteria.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
</div>

<!-- User Edit Modal -->
{#if showUserForm && editingUser}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div class="bg-background border-2 border-border rounded-2xl shadow-2xl backdrop-blur-md p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Edit User: {editingUser.name || editingUser.nickname || 'Unnamed'}
        </h2>
        <button 
          onclick={() => { showUserForm = false; editingUser = null; }}
          class="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="edit-user-name" class="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input 
                id="edit-user-name" 
                bind:value={editingUser.name} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-user-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <input 
                id="edit-user-phone" 
                bind:value={editingUser.phone} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-user-role" class="block text-sm font-medium text-foreground mb-2">User Role</label>
              <select 
                id="edit-user-role" 
                bind:value={editingUser.role} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
                <option value="user">User</option>
                <option value="operator">Operator</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            
            <div class="flex flex-col justify-center space-y-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  bind:checked={editingUser.is_active} 
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Active User</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  bind:checked={editingUser.has_accommodation} 
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Has Accommodation</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Languages -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Languages</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each AVAILABLE_LANGUAGES as lang}
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/40 transition-colors">
                <input 
                  type="checkbox" 
                  checked={editingUser.languages?.includes(lang.code)}
                  onchange={() => toggleLanguage(lang.code)}
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm text-foreground">{lang.name}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Services -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Services</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each AVAILABLE_SERVICES as service}
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/40 transition-colors">
                <input 
                  type="checkbox" 
                  checked={editingUser.services?.includes(service)}
                  onchange={() => toggleService(service)}
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm text-foreground">{service}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Contact Details -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Contact Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label for="edit-first-name" class="block text-sm font-medium text-foreground mb-2">First Name</label>
              <input 
                id="edit-first-name"
                bind:value={editingUser.contactDetails.firstName}
                placeholder="Enter first name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-last-name" class="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <input 
                id="edit-last-name"
                bind:value={editingUser.contactDetails.lastName}
                placeholder="Enter last name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-dob" class="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
              <input 
                id="edit-dob"
                bind:value={editingUser.contactDetails.dateOfBirth}
                type="date"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-id-number" class="block text-sm font-medium text-foreground mb-2">ID Number</label>
              <input 
                id="edit-id-number"
                bind:value={editingUser.contactDetails.idNumber}
                placeholder="Enter ID number"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-street" class="block text-sm font-medium text-foreground mb-2">Street Name</label>
              <input 
                id="edit-street"
                bind:value={editingUser.contactDetails.streetName}
                placeholder="Enter street name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-house-number" class="block text-sm font-medium text-foreground mb-2">House Number</label>
              <input 
                id="edit-house-number"
                bind:value={editingUser.contactDetails.houseNumber}
                placeholder="Enter house number"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-postal-code" class="block text-sm font-medium text-foreground mb-2">Postal Code</label>
              <input 
                id="edit-postal-code"
                bind:value={editingUser.contactDetails.postalCode}
                placeholder="Enter postal code"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-city" class="block text-sm font-medium text-foreground mb-2">City</label>
              <input 
                id="edit-city"
                bind:value={editingUser.contactDetails.city}
                placeholder="Enter city"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-country" class="block text-sm font-medium text-foreground mb-2">Country</label>
              <input 
                id="edit-country"
                bind:value={editingUser.contactDetails.country}
                placeholder="Enter country"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <button 
          onclick={() => { showUserForm = false; editingUser = null; }}
          class="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all font-medium">
          Cancel
        </button>
        
        <button 
          onclick={handleUserUpdate}
          disabled={$isLoading}
          class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2">
          {#if $isLoading}
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Saving Changes...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
