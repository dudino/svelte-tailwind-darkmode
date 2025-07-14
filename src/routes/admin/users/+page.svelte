<!--
  Admin Users Management
  CRUD interface for managing users (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Filter, 
    Eye,
    UserCheck,
    UserX,
    Download,
    Upload,
    Users
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { 
    users,
    usersActions,
    usersState,
    filteredUsers
  } from '$lib/stores/admin';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import UserFormModal from '$lib/components/admin/UserFormModal.svelte';
  import UserDetailModal from '$lib/components/admin/UserDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

  // Local state for UI
  let searchTerm = '';
  let filterRole = '';
  let filterStatus = '';
  let selectedUsers: string[] = [];
  let showUserForm = false;
  let showUserDetail = false;
  let showDeleteConfirm = false;
  let editingUser: any = null;
  let viewingUser: any = null;
  let userToDelete: any = null;

  // State from store
  $: loading = $usersState.loading;
  $: error = $usersState.error;

  // Set up filters in the store
  $: {
    usersActions.setFilters({
      search: searchTerm,
      role: filterRole,
      status: filterStatus
    });
  }

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  $: totalPages = Math.ceil($filteredUsers.length / itemsPerPage);
  $: paginatedUsers = $filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Role options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'operator', label: 'Operator' },
    { value: 'administrator', label: 'Administrator' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  // Filtered and paginated users - remove this section since we're using the store's filteredUsers

  onMount(() => {
    // Load users using the users store
    usersActions.loadUsers();
  });

  function handleCreateUser() {
    editingUser = null;
    showUserForm = true;
  }

  function handleEditUser(user: any) {
    editingUser = { ...user };
    showUserForm = true;
  }

  function handleViewUser(user: any) {
    viewingUser = user;
    showUserDetail = true;
  }

  function handleDeleteUser(user: any) {
    userToDelete = user;
    showDeleteConfirm = true;
  }

  async function confirmDeleteUser() {
    if (!userToDelete) return;
    
    try {
      await usersActions.deleteUser(userToDelete.id);
      showDeleteConfirm = false;
      userToDelete = null;
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }

  function handleBulkAction(action: string) {
    // TODO: Implement bulk actions
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
  }

  function toggleUserSelection(userId: string) {
    if (selectedUsers.includes(userId)) {
      selectedUsers = selectedUsers.filter(id => id !== userId);
    } else {
      selectedUsers = [...selectedUsers, userId];
    }
  }

  function toggleSelectAll() {
    if (selectedUsers.length === paginatedUsers.length) {
      selectedUsers = [];
    } else {
      selectedUsers = paginatedUsers.map(user => user.id);
    }
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'operator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  function getStatusBadgeClass(isActive: boolean) {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>User Management - Admin - Affinity</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-2">
        <Users class="h-8 w-8 text-primary" />
        User Management
      </h1>
      <p class="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
    </div>
    <Button on:click={handleCreateUser} class="flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Add User
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          bind:value={searchTerm}
          placeholder="Search users..."
          class="pl-10"
        />
      </div>

      <!-- Role Filter -->
      <select bind:value={filterRole} class="px-3 py-2 border rounded-md bg-background">
        {#each roleOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Status Filter -->
      <select bind:value={filterStatus} class="px-3 py-2 border rounded-md bg-background">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Bulk Actions -->
      <div class="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={selectedUsers.length === 0}
          on:click={() => handleBulkAction('activate')}
        >
          <UserCheck class="h-4 w-4 mr-1" />
          Activate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={selectedUsers.length === 0}
          on:click={() => handleBulkAction('deactivate')}
        >
          <UserX class="h-4 w-4 mr-1" />
          Deactivate
        </Button>
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Error: {error}</p>
    </div>
  {/if}

  <!-- Users Table -->
  <div class="bg-card rounded-lg border overflow-hidden">
    {#if loading}
      <div class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-muted-foreground">Loading users...</p>
      </div>
    {:else if paginatedUsers.length === 0}
      <div class="p-8 text-center">
        <p class="text-muted-foreground">No users found</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                  on:change={toggleSelectAll}
                  class="rounded"
                />
              </th>
              <th class="px-4 py-3 text-left font-medium">Name</th>
              <th class="px-4 py-3 text-left font-medium">Email</th>
              <th class="px-4 py-3 text-left font-medium">Role</th>
              <th class="px-4 py-3 text-left font-medium">Status</th>
              <th class="px-4 py-3 text-left font-medium">Last Login</th>
              <th class="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedUsers as user}
              <tr class="border-t hover:bg-muted/30 transition-colors">
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    on:change={() => toggleUserSelection(user.id)}
                    class="rounded"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    {#if user.avatar && typeof user.avatar === 'string'}
                      <img 
                        src={user.avatar} 
                        alt={user.name || user.email}
                        class="w-8 h-8 rounded-full object-cover"
                      />
                    {:else}
                      <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div>
                      <p class="font-medium">{user.name || 'No name'}</p>
                      {#if (user as any).phone}
                        <p class="text-sm text-muted-foreground">{(user as any).phone}</p>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm">{user.email}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getRoleBadgeClass((user as any).role || 'user')}">
                    {(user as any).role || 'user'}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass((user as any).is_active ?? false)}">
                    {(user as any).is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate((user as any).last_login_at)}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      on:click={() => handleViewUser(user)}
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      on:click={() => handleEditUser(user)}
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      on:click={() => handleDeleteUser(user)}
                      class="text-destructive hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between px-4 py-3 border-t">
          <div class="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, $filteredUsers.length)} of {$filteredUsers.length} users
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              on:click={() => currentPage--}
            >
              Previous
            </Button>
            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
              {#if page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  on:click={() => currentPage = page}
                >
                  {page}
                </Button>
              {:else if page === currentPage - 2 || page === currentPage + 2}
                <span class="px-2">...</span>
              {/if}
            {/each}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              on:click={() => currentPage++}
            >
              Next
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- User Form Modal -->
<UserFormModal 
  bind:show={showUserForm}
  bind:user={editingUser}
  on:saved={() => usersActions.loadUsers()}
/>

<!-- User Detail Modal -->
<UserDetailModal 
  bind:show={showUserDetail}
  bind:user={viewingUser}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete User"
  description="Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteUser}
  loading={loading}
/>
