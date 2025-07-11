<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Search, Filter, Edit, Trash2, Users, Shield, UserCheck } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { User } from '$lib/types/user';
	
	const dispatch = createEventDispatcher();
	
	let users: User[] = [
		{
			id: 'admin-1',
			firstName: 'John',
			lastName: 'Administrator',
			email: 'admin@affinity.com',
			phoneNumber: '+420 123 456 789',
			role: 'Administrator',
			isActive: true,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date()
		},
		{
			id: 'operator-1',
			firstName: 'Sarah',
			lastName: 'Operator',
			email: 'operator@affinity.com',
			phoneNumber: '+420 987 654 321',
			role: 'Operator',
			isActive: true,
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date()
		},
		{
			id: 'masseuse-1',
			firstName: 'Tiffany',
			lastName: 'M',
			email: 'tiffany@affinity.com',
			phoneNumber: '+420 555 111 222',
			role: 'Masseuse',
			isActive: true,
			createdAt: new Date('2024-07-01'),
			updatedAt: new Date()
		},
		{
			id: 'masseuse-2',
			firstName: 'Monika',
			lastName: 'S',
			email: 'monika@affinity.com',
			phoneNumber: '+420 444 333 555',
			role: 'Masseuse',
			isActive: true,
			createdAt: new Date('2024-06-15'),
			updatedAt: new Date()
		},
		{
			id: 'masseuse-3',
			firstName: 'Andrea',
			lastName: 'K',
			email: 'andrea@affinity.com',
			phoneNumber: '+420 666 777 888',
			role: 'Masseuse',
			isActive: false,
			createdAt: new Date('2024-05-10'),
			updatedAt: new Date()
		}
	];
	
	let searchQuery = '';
	let filterRole: 'All' | 'Administrator' | 'Operator' | 'Masseuse' = 'All';
	let filterStatus: 'All' | 'Active' | 'Inactive' = 'All';
	let showCreateModal = false;
	let showEditModal = false;
	let selectedUser: User | null = null;
	let isLoading = false;
	
	$: filteredUsers = users.filter(user => {
		// Search filter
		if (searchQuery && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}
		
		// Role filter
		if (filterRole !== 'All' && user.role !== filterRole) {
			return false;
		}
		
		// Status filter
		if (filterStatus === 'Active' && !user.isActive) {
			return false;
		}
		if (filterStatus === 'Inactive' && user.isActive) {
			return false;
		}
		
		return true;
	});
	
	function getRoleIcon(role: string) {
		switch (role) {
			case 'Administrator': return Shield;
			case 'Operator': return UserCheck;
			case 'Masseuse': return Users;
			default: return Users;
		}
	}
	
	function getRoleColor(role: string) {
		switch (role) {
			case 'Administrator': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			case 'Operator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'Masseuse': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
		}
	}
	
	function openCreateModal() {
		selectedUser = null;
		showCreateModal = true;
	}
	
	function openEditModal(user: User) {
		selectedUser = user;
		showEditModal = true;
	}
	
	function closeModals() {
		showCreateModal = false;
		showEditModal = false;
		selectedUser = null;
	}
	
	async function handleCreateUser(userData: Partial<User>) {
		isLoading = true;
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newUser: User = {
				id: `user-${Date.now()}`,
				firstName: userData.firstName!,
				lastName: userData.lastName!,
				email: userData.email!,
				phoneNumber: userData.phoneNumber!,
				role: userData.role as any,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			
			users = [...users, newUser];
			closeModals();
		} catch (error) {
			console.error('Failed to create user:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleUpdateUser(userData: Partial<User>) {
		if (!selectedUser) return;
		
		isLoading = true;
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			users = users.map(user => 
				user.id === selectedUser!.id 
					? { ...user, ...userData, updatedAt: new Date() }
					: user
			);
			closeModals();
		} catch (error) {
			console.error('Failed to update user:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleDeleteUser(userId: string) {
		if (!confirm('Are you sure you want to delete this user?')) return;
		
		isLoading = true;
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));
			
			users = users.filter(user => user.id !== userId);
		} catch (error) {
			console.error('Failed to delete user:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function toggleUserStatus(userId: string) {
		isLoading = true;
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));
			
			users = users.map(user => 
				user.id === userId 
					? { ...user, isActive: !user.isActive, updatedAt: new Date() }
					: user
			);
		} catch (error) {
			console.error('Failed to toggle user status:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">User Management</h1>
			<p class="text-sm text-muted-foreground">Manage administrators, operators, and masseuses</p>
		</div>
		
		<Button on:click={openCreateModal} class="glass-button">
			<Plus class="h-4 w-4 mr-2" />
			Add New User
		</Button>
	</div>
	
	<!-- Filters -->
	<div class="flex flex-wrap gap-4 items-center bg-accent/20 p-4 rounded-lg">
		<div class="relative flex-1 min-w-64">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<input
				type="text"
				placeholder="Search users..."
				bind:value={searchQuery}
				class="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
			/>
		</div>
		
		<select
			bind:value={filterRole}
			class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
		>
			<option value="All">All Roles</option>
			<option value="Administrator">Administrator</option>
			<option value="Operator">Operator</option>
			<option value="Masseuse">Masseuse</option>
		</select>
		
		<select
			bind:value={filterStatus}
			class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
		>
			<option value="All">All Status</option>
			<option value="Active">Active</option>
			<option value="Inactive">Inactive</option>
		</select>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-foreground">{users.length}</div>
			<div class="text-sm text-muted-foreground">Total Users</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'Administrator').length}</div>
			<div class="text-sm text-muted-foreground">Administrators</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'Operator').length}</div>
			<div class="text-sm text-muted-foreground">Operators</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'Masseuse').length}</div>
			<div class="text-sm text-muted-foreground">Masseuses</div>
		</div>
	</div>
	
	<!-- Users Table -->
	<div class="enhanced-card rounded-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-accent/50">
					<tr>
						<th class="text-left p-4 font-medium text-foreground">User</th>
						<th class="text-left p-4 font-medium text-foreground">Role</th>
						<th class="text-left p-4 font-medium text-foreground">Contact</th>
						<th class="text-left p-4 font-medium text-foreground">Status</th>
						<th class="text-left p-4 font-medium text-foreground">Created</th>
						<th class="text-right p-4 font-medium text-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers as user}
						<tr class="border-t border-border hover:bg-accent/20 transition-colors">
							<td class="p-4">
								<div class="flex items-center space-x-3">
									<div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
										<span class="text-primary-foreground font-medium text-sm">
											{user.firstName[0]}{user.lastName[0]}
										</span>
									</div>
									<div>
										<div class="font-medium text-foreground">{user.firstName} {user.lastName}</div>
										<div class="text-sm text-muted-foreground">{user.email}</div>
									</div>
								</div>
							</td>
							<td class="p-4">
								<span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
									<svelte:component this={getRoleIcon(user.role)} class="h-3 w-3 mr-1" />
									{user.role}
								</span>
							</td>
							<td class="p-4">
								<div class="text-sm text-foreground">{user.phoneNumber}</div>
							</td>
							<td class="p-4">
								<button
									on:click={() => toggleUserStatus(user.id)}
									disabled={isLoading}
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
										user.isActive 
											? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
									}`}
								>
									{user.isActive ? 'Active' : 'Inactive'}
								</button>
							</td>
							<td class="p-4">
								<div class="text-sm text-muted-foreground">
									{user.createdAt.toLocaleDateString()}
								</div>
							</td>
							<td class="p-4">
								<div class="flex items-center justify-end space-x-2">
									<Button
										on:click={() => openEditModal(user)}
										variant="outline"
										size="sm"
										class="glass-button"
									>
										<Edit class="h-3 w-3" />
									</Button>
									<Button
										on:click={() => handleDeleteUser(user.id)}
										variant="outline"
										size="sm"
										class="glass-button hover:bg-red-50 hover:border-red-200 hover:text-red-600"
										disabled={isLoading}
									>
										<Trash2 class="h-3 w-3" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		{#if filteredUsers.length === 0}
			<div class="text-center py-12">
				<Users class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-foreground mb-2">No users found</h3>
				<p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
			</div>
		{/if}
	</div>
</div>

<!-- Create User Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Add New User</h2>
			</div>
			<form on:submit|preventDefault={() => handleCreateUser({
				firstName: document.getElementById('create-firstName')?.value,
				lastName: document.getElementById('create-lastName')?.value,
				email: document.getElementById('create-email')?.value,
				phoneNumber: document.getElementById('create-phone')?.value,
				role: document.getElementById('create-role')?.value
			})}>
				<div class="p-6 space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="create-firstName" class="block text-sm font-medium text-foreground mb-2">First Name</label>
							<input
								id="create-firstName"
								type="text"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="create-lastName" class="block text-sm font-medium text-foreground mb-2">Last Name</label>
							<input
								id="create-lastName"
								type="text"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div>
						<label for="create-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
						<input
							id="create-email"
							type="email"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
						<input
							id="create-phone"
							type="tel"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-role" class="block text-sm font-medium text-foreground mb-2">Role</label>
						<select
							id="create-role"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						>
							<option value="">Select Role</option>
							<option value="Administrator">Administrator</option>
							<option value="Operator">Operator</option>
							<option value="Masseuse">Masseuse</option>
						</select>
					</div>
				</div>
				
				<div class="p-6 border-t border-border flex justify-end space-x-3">
					<Button on:click={closeModals} variant="outline" class="glass-button">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} class="glass-button">
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Create User
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && selectedUser}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Edit User</h2>
			</div>
			<form on:submit|preventDefault={() => handleUpdateUser({
				firstName: document.getElementById('edit-firstName')?.value,
				lastName: document.getElementById('edit-lastName')?.value,
				email: document.getElementById('edit-email')?.value,
				phoneNumber: document.getElementById('edit-phone')?.value,
				role: document.getElementById('edit-role')?.value
			})}>
				<div class="p-6 space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="edit-firstName" class="block text-sm font-medium text-foreground mb-2">First Name</label>
							<input
								id="edit-firstName"
								type="text"
								value={selectedUser.firstName}
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="edit-lastName" class="block text-sm font-medium text-foreground mb-2">Last Name</label>
							<input
								id="edit-lastName"
								type="text"
								value={selectedUser.lastName}
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div>
						<label for="edit-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
						<input
							id="edit-email"
							type="email"
							value={selectedUser.email}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="edit-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
						<input
							id="edit-phone"
							type="tel"
							value={selectedUser.phoneNumber}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="edit-role" class="block text-sm font-medium text-foreground mb-2">Role</label>
						<select
							id="edit-role"
							value={selectedUser.role}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						>
							<option value="Administrator">Administrator</option>
							<option value="Operator">Operator</option>
							<option value="Masseuse">Masseuse</option>
						</select>
					</div>
				</div>
				
				<div class="p-6 border-t border-border flex justify-end space-x-3">
					<Button on:click={closeModals} variant="outline" class="glass-button">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} class="glass-button">
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Update User
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
