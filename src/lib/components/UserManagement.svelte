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
    syncStatus,
    login, 
    register, 
    logout,
    updateUser,
    deleteUser,
    fetchUsersFromServer,
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

  // Computed values
  $: filteredUsers = $users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchLower) ||
                         (user.email?.toLowerCase() || '').includes(searchLower) ||
                         (user.phone?.toLowerCase() || '').includes(searchLower) ||
                         // Backwards compatibility with old field names
                         (user.nickname?.toLowerCase() || '').includes(searchLower);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  onMount(() => {
    loadUsersFromStorage();
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
    editingUser = { ...user };
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

  async function handleUserDelete(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
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

<div class="container mx-auto p-6 max-w-6xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">User Management System</h1>
    <div class="flex items-center gap-4 text-sm">
      <span class="flex items-center gap-2">
        Status: 
        <span class="px-2 py-1 rounded text-xs font-semibold" 
              class:bg-green-100={$syncStatus === 'online'}
              class:text-green-800={$syncStatus === 'online'}
              class:bg-yellow-100={$syncStatus === 'syncing'}
              class:text-yellow-800={$syncStatus === 'syncing'}
              class:bg-red-100={$syncStatus === 'offline'}
              class:text-red-800={$syncStatus === 'offline'}>
          {$syncStatus}
        </span>
      </span>
      
      {#if $syncStatus === 'online'}
        <button 
          onclick={() => syncData()} 
          class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          disabled={$isLoading}>
          Sync Data
        </button>
      {/if}
    </div>
  </div>

  <!-- Error Display -->
  {#if $error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {$error}
      <button onclick={() => error.set('')} class="float-right font-bold">×</button>
    </div>
  {/if}

  <!-- Authentication Section -->
  {#if !$isAuthenticated}
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Authentication Required</h2>
      
      <div class="flex gap-4">
        <button 
          onclick={() => showLoginForm = !showLoginForm}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </button>
        
        <button 
          onclick={() => showRegisterForm = !showRegisterForm}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Register
        </button>
      </div>

      <!-- Login Form -->
      {#if showLoginForm}
        <div class="mt-4 p-4 border rounded">
          <h3 class="font-semibold mb-3">Login</h3>
          <div class="space-y-3">
            <input 
              bind:value={loginForm.email}
              type="email" 
              placeholder="Email"
              class="w-full p-2 border rounded">
            
            <input 
              bind:value={loginForm.password}
              type="password" 
              placeholder="Password"
              class="w-full p-2 border rounded">
            
            <button 
              onclick={handleLogin}
              disabled={$isLoading}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
              {$isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      {/if}

      <!-- Register Form -->
      {#if showRegisterForm}
        <div class="mt-4 p-4 border rounded">
          <h3 class="font-semibold mb-3">Register New User</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input 
              bind:value={registerForm.name}
              placeholder="Name*"
              class="p-2 border rounded">
            
            <input 
              bind:value={registerForm.email}
              type="email" 
              placeholder="Email*"
              class="p-2 border rounded">
            
            <input 
              bind:value={registerForm.phone}
              placeholder="Phone"
              class="p-2 border rounded">
            
            <input 
              bind:value={registerForm.password}
              type="password" 
              placeholder="Password*"
              class="p-2 border rounded">
            
            <input 
              bind:value={registerForm.passwordConfirm}
              type="password" 
              placeholder="Confirm Password*"
              class="p-2 border rounded">
            
            <select bind:value={registerForm.role} class="p-2 border rounded">
              <option value="user">User</option>
              <option value="operator">Operator</option>
              <option value="administrator">Administrator</option>
            </select>
            
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-1">
                <input 
                  bind:checked={registerForm.is_active}
                  type="checkbox">
                Active
              </label>
              
              <label class="flex items-center gap-1">
                <input 
                  bind:checked={registerForm.has_accommodation}
                  type="checkbox">
                Has Accommodation
              </label>
            </div>
          </div>
          
          <button 
            onclick={handleRegister}
            disabled={$isLoading}
            class="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
            {$isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <!-- User Dashboard -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-semibold">Welcome, {$currentUser?.nickname}</h2>
          <p class="text-gray-600">Role: {$currentUser?.role} | Status: {$currentUser?.isActive ? 'Active' : 'Inactive'}</p>
        </div>
        
        <button 
          onclick={logout}
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>

    <!-- User Management Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">User Management</h2>
        
        <div class="flex gap-4">
          <button 
            onclick={() => fetchUsersFromServer()}
            disabled={$isLoading || $syncStatus === 'offline'}
            class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50">
            Refresh from Server
          </button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="flex gap-4 mb-4">
        <input 
          bind:value={searchQuery}
          placeholder="Search users..."
          class="flex-1 p-2 border rounded">
        
        <select bind:value={roleFilter} class="p-2 border rounded">
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="operator">Operators</option>
          <option value="administrator">Administrators</option>
        </select>
      </div>

      <!-- Users List -->
      <div class="space-y-2">
        {#each filteredUsers as user (user.id)}
          <div class="border rounded p-4 flex justify-between items-center">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="font-semibold">{user.name || user.nickname || 'Unnamed'}</h3>
                <span class="px-2 py-1 text-xs rounded" 
                      class:bg-blue-100={user.role === 'user'}
                      class:bg-green-100={user.role === 'operator'}
                      class:bg-purple-100={user.role === 'administrator'}>
                  {user.role}
                </span>
                {#if !(user.is_active ?? user.isActive ?? true)}
                  <span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
                {/if}
                {#if user.syncPending}
                  <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Sync Pending</span>
                {/if}
              </div>
              <p class="text-sm text-gray-600">{user.email} | {user.phone}</p>
              {#if user.languages && user.languages.length > 0}
                <p class="text-xs text-gray-500">Languages: {user.languages.join(', ')}</p>
              {/if}
            </div>
            
            <div class="flex gap-2">
              <button 
                onclick={() => editUser(user)}
                class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                Edit
              </button>
              
              {#if $currentUser?.role === 'administrator' && user.id !== $currentUser?.id}
                <button 
                  onclick={() => handleUserDelete(user.id)}
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                  Delete
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

<!-- User Edit Modal -->
{#if showUserForm && editingUser}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">Edit User: {editingUser.name || editingUser.nickname || 'Unnamed'}</h2>
      
      <div class="space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input bind:value={editingUser.name} class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Phone</label>
            <input bind:value={editingUser.phone} class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Role</label>
            <select bind:value={editingUser.role} class="w-full p-2 border rounded">
              <option value="user">User</option>
              <option value="operator">Operator</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
          
          <div class="flex items-center gap-4 pt-6">
            <label class="flex items-center gap-1">
              <input bind:checked={editingUser.is_active} type="checkbox">
              Active
            </label>
            
            <label class="flex items-center gap-1">
              <input bind:checked={editingUser.has_accommodation} type="checkbox">
              Has Accommodation
            </label>
          </div>
        </div>

        <!-- Languages -->
        <div>
          <label class="block text-sm font-medium mb-2">Languages</label>
          <div class="flex flex-wrap gap-2">
            {#each AVAILABLE_LANGUAGES as lang}
              <label class="flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={editingUser.languages?.includes(lang.code)}
                  onchange={() => toggleLanguage(lang.code)}>
                {lang.name}
              </label>
            {/each}
          </div>
        </div>

        <!-- Services -->
        <div>
          <label class="block text-sm font-medium mb-2">Services</label>
          <div class="flex flex-wrap gap-2">
            {#each AVAILABLE_SERVICES as service}
              <label class="flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={editingUser.services?.includes(service)}
                  onchange={() => toggleService(service)}>
                {service}
              </label>
            {/each}
          </div>
        </div>

        <!-- Contact Details -->
        <div>
          <h3 class="text-lg font-medium mb-2">Contact Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input 
              bind:value={editingUser.contactDetails.firstName}
              placeholder="First Name"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.lastName}
              placeholder="Last Name"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.dateOfBirth}
              type="date"
              placeholder="Date of Birth"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.idNumber}
              placeholder="ID Number"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.streetName}
              placeholder="Street Name"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.houseNumber}
              placeholder="House Number"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.postalCode}
              placeholder="Postal Code"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.city}
              placeholder="City"
              class="p-2 border rounded">
            
            <input 
              bind:value={editingUser.contactDetails.country}
              placeholder="Country"
              class="p-2 border rounded">
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end gap-3 mt-6">
        <button 
          onclick={() => { showUserForm = false; editingUser = null; }}
          class="px-4 py-2 border rounded hover:bg-gray-50">
          Cancel
        </button>
        
        <button 
          onclick={handleUserUpdate}
          disabled={$isLoading}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
          {$isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
{/if}
