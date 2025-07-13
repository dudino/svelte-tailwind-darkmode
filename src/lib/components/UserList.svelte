<!--
  User List Component
  Displays and manages the list of users with filtering and search
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    currentUser, 
    users, 
    isLoading, 
    syncData,
    updateUser,
    register,
    error
  } from '$lib/stores';
  import type { UserRole, CreateUserData } from '$lib/types/user';

  const dispatch = createEventDispatcher();

  // Search and filter
  let searchQuery = '';
  let roleFilter: UserRole | 'all' = 'all';
  let statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Registration form state
  let showRegisterForm = false;
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

  // Helper function for flexible phone number matching
  function matchesPhoneSearch(phone: string, searchQuery: string): boolean {
    if (!phone || !searchQuery) return false;
    
    // Remove all non-digit characters from both phone and search
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanSearch = searchQuery.replace(/\D/g, '');
    
    if (cleanSearch.length === 0) return false;
    
    // Check if all digits in search query appear in phone number in any order
    const searchDigits = cleanSearch.split('');
    const phoneDigits = cleanPhone.split('');
    
    return searchDigits.every(digit => {
      const index = phoneDigits.indexOf(digit);
      if (index !== -1) {
        phoneDigits.splice(index, 1); // Remove found digit to handle duplicates
        return true;
      }
      return false;
    });
  }

  // Computed values
  $: filteredUsers = $users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    
    // Enhanced search with flexible phone number matching
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchLower) ||
                         (user.email?.toLowerCase() || '').includes(searchLower) ||
                         // Backwards compatibility with old field names
                         (user.nickname?.toLowerCase() || '').includes(searchLower) ||
                         // Flexible phone number search - exact match or digit-order-independent
                         (user.phone?.toLowerCase() || '').includes(searchLower) ||
                         matchesPhoneSearch(user.phone || '', searchQuery);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // Check status filter
    const userStatus = user.is_active ?? user.isActive ?? true;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && userStatus) ||
                         (statusFilter === 'inactive' && !userStatus);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  function editUser(user: any) {
    dispatch('editUser', user);
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

  // Registration functions
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
</script>

<div class="bg-background border-2 border-border rounded-xl shadow-2xl backdrop-blur-md p-6">
  <h2 class="text-xl text-center mb-12 font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
    Welcome, {$currentUser?.name}
  </h2>
  
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
      User Management
    </h2>
    
    <div class="flex gap-3">
      {#if $currentUser?.role === 'administrator'}
        <button 
          onclick={() => showRegisterForm = !showRegisterForm}
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all shadow-sm font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      {/if}
      
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
        placeholder="Search by name, email, or phone (digits in any order)..."
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
      <div class="border-2 border-border rounded-xl p-6 flex justify-between items-start transition-all bg-background shadow-xl hover:shadow-2xl backdrop-blur-sm {!isActive ? 'opacity-70 border-destructive/40' : ''}">
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

<!-- Register User Modal (Administrator Only) -->
{#if showRegisterForm && $currentUser?.role === 'administrator'}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div class="bg-background border-2 border-border rounded-2xl shadow-2xl backdrop-blur-md p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Register New User
        </h2>
        <button 
          onclick={() => { showRegisterForm = false; resetRegisterForm(); }}
          aria-label="Close registration form"
          class="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
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
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <button 
          onclick={() => { showRegisterForm = false; resetRegisterForm(); }}
          class="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all font-medium">
          Cancel
        </button>
        
        <button 
          onclick={handleRegister}
          disabled={$isLoading}
          class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2">
          {#if $isLoading}
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Creating User...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create User
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
