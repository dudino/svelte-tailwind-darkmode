<!--
  User Management Component
  Main component that orchestrates user authentication and management
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    isAuthenticated, 
    syncData,
    loadUsersFromStorage
  } from '$lib/stores';
  
  // Import sub-components
  import ErrorDisplay from './ErrorDisplay.svelte';
  import UserAuth from './UserAuth.svelte';
  import UserList from './UserList.svelte';
  import UserEditModal from './UserEditModal.svelte';

  // Modal states
  let showUserForm = false;
  let editingUser: any = null;

  onMount(() => {
    loadUsersFromStorage();
    
    // If user is authenticated, automatically sync data from server
    if ($isAuthenticated) {
      syncData();
    }
  });

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

  function handleEditUser(event: CustomEvent) {
    editUser(event.detail);
  }

  function handleCloseModal() {
    showUserForm = false;
    editingUser = null;
  }

  function handleUserUpdated() {
    // User was successfully updated, modal will close automatically
    // Could add additional logic here if needed
  }
</script>

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
  <ErrorDisplay />

  <!-- Authentication or User Dashboard -->
  {#if !$isAuthenticated}
    <UserAuth />
  {:else}
    <UserList on:editUser={handleEditUser} />
  {/if}
</div>

<!-- User Edit Modal -->
<UserEditModal 
  bind:showUserForm 
  bind:editingUser 
  on:close={handleCloseModal}
  on:userUpdated={handleUserUpdated} />