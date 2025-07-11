<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Search, Edit, Trash2, User, Phone, Mail, Calendar, Star, Eye, Filter } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ClientProfile } from '$lib/types/masseuse';
	
	const dispatch = createEventDispatcher();
	
	// Mock client data
	let clients: (ClientProfile & { lastVisit?: string; totalSpent?: number; status?: 'active' | 'inactive' })[] = [
		{
			id: 'client-1',
			name: 'Anna Novakova',
			email: 'anna.novakova@email.com',
			phone: '+420 123 456 789',
			preferences: {
				massageTypes: ['Swedish Massage', 'Relaxation Massage'],
				pressure: 'medium',
				temperature: 'warm',
				music: true,
				aromatherapy: true
			},
			medicalNotes: 'No known allergies. Prefers medium pressure.',
			lastVisit: '2024-01-18',
			totalSpent: 12000,
			status: 'active'
		},
		{
			id: 'client-2',
			name: 'Pavel Dvorak',
			email: 'pavel.dvorak@email.com',
			phone: '+420 987 654 321',
			preferences: {
				massageTypes: ['Deep Tissue Massage', 'Sports Massage'],
				pressure: 'firm',
				temperature: 'hot',
				music: false,
				aromatherapy: false
			},
			medicalNotes: 'Lower back issues. Prefers firm pressure on shoulders.',
			lastVisit: '2024-01-15',
			totalSpent: 8400,
			status: 'active'
		},
		{
			id: 'client-3',
			name: 'Marie Svoboda',
			email: 'marie.svoboda@email.com',
			phone: '+420 555 123 456',
			preferences: {
				massageTypes: ['Hot Stone Massage', 'Aromatherapy Massage'],
				pressure: 'light',
				temperature: 'warm',
				music: true,
				aromatherapy: true
			},
			medicalNotes: 'Sensitive skin. Allergic to lavender oil.',
			lastVisit: '2024-01-10',
			totalSpent: 15600,
			status: 'active'
		},
		{
			id: 'client-4',
			name: 'Jan Prochazka',
			email: 'jan.prochazka@email.com',
			phone: '+420 777 888 999',
			preferences: {
				massageTypes: ['Swedish Massage'],
				pressure: 'medium',
				temperature: 'neutral',
				music: true,
				aromatherapy: false
			},
			medicalNotes: 'Regular client. No special requirements.',
			lastVisit: '2023-12-20',
			totalSpent: 4200,
			status: 'inactive'
		}
	];
	
	let searchQuery = '';
	let statusFilter = 'all';
	let showCreateClientModal = false;
	let showEditClientModal = false;
	let showClientDetails = false;
	let selectedClient: typeof clients[0] | null = null;
	let isLoading = false;
	
	const statusOptions = [
		{ value: 'all', label: 'All Clients' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' }
	];
	
	$: filteredClients = clients.filter(client => {
		// Search filter
		if (searchQuery) {
			const searchTerm = searchQuery.toLowerCase();
			if (!client.name.toLowerCase().includes(searchTerm) &&
				!client.email.toLowerCase().includes(searchTerm) &&
				!client.phone.includes(searchTerm)) {
				return false;
			}
		}
		
		// Status filter
		if (statusFilter !== 'all' && client.status !== statusFilter) {
			return false;
		}
		
		return true;
	});
	
	$: clientStats = {
		total: clients.length,
		active: clients.filter(c => c.status === 'active').length,
		inactive: clients.filter(c => c.status === 'inactive').length,
		totalRevenue: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
		averageSpent: clients.length > 0 ? clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / clients.length : 0
	};
	
	function openCreateClientModal() {
		selectedClient = null;
		showCreateClientModal = true;
	}
	
	function openEditClientModal(client: typeof clients[0]) {
		selectedClient = client;
		showEditClientModal = true;
	}
	
	function openClientDetails(client: typeof clients[0]) {
		selectedClient = client;
		showClientDetails = true;
	}
	
	function closeModals() {
		showCreateClientModal = false;
		showEditClientModal = false;
		showClientDetails = false;
		selectedClient = null;
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'active': return 'text-green-600 bg-green-50 border-green-200';
			case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
			default: return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
	
	function formatPrice(price: number) {
		return `${price.toLocaleString()} CZK`;
	}
	
	async function handleCreateClient(clientData: Partial<ClientProfile>) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newClient = {
				id: `client-${Date.now()}`,
				name: clientData.name!,
				email: clientData.email!,
				phone: clientData.phone!,
				preferences: clientData.preferences || {
					massageTypes: [],
					pressure: 'medium',
					temperature: 'warm',
					music: true,
					aromatherapy: false
				},
				medicalNotes: clientData.medicalNotes || '',
				totalSpent: 0,
				status: 'active' as const
			};
			
			clients = [...clients, newClient];
			closeModals();
		} catch (error) {
			console.error('Failed to create client:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleUpdateClient(clientData: Partial<typeof clients[0]>) {
		if (!selectedClient) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			clients = clients.map(client => 
				client.id === selectedClient!.id 
					? { ...client, ...clientData }
					: client
			);
			closeModals();
		} catch (error) {
			console.error('Failed to update client:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleDeleteClient(clientId: string) {
		if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			clients = clients.filter(client => client.id !== clientId);
		} catch (error) {
			console.error('Failed to delete client:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function toggleClientStatus(clientId: string) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			clients = clients.map(client => 
				client.id === clientId 
					? { ...client, status: client.status === 'active' ? 'inactive' : 'active' }
					: client
			);
		} catch (error) {
			console.error('Failed to update client status:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Client Management</h1>
			<p class="text-sm text-muted-foreground">Manage client profiles and preferences</p>
		</div>
		
		<Button on:click={openCreateClientModal} class="glass-button">
			<Plus class="h-4 w-4 mr-2" />
			Add New Client
		</Button>
	</div>
	
	<!-- Filters -->
	<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
		<div class="relative flex-1 max-w-md">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<input
				type="text"
				placeholder="Search clients..."
				bind:value={searchQuery}
				class="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
			/>
		</div>
		
		<select
			bind:value={statusFilter}
			class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
		>
			{#each statusOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-foreground">{clientStats.total}</div>
			<div class="text-sm text-muted-foreground">Total Clients</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-green-600">{clientStats.active}</div>
			<div class="text-sm text-muted-foreground">Active</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-gray-600">{clientStats.inactive}</div>
			<div class="text-sm text-muted-foreground">Inactive</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-primary">{formatPrice(clientStats.totalRevenue)}</div>
			<div class="text-sm text-muted-foreground">Total Revenue</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-purple-600">{formatPrice(clientStats.averageSpent)}</div>
			<div class="text-sm text-muted-foreground">Avg per Client</div>
		</div>
	</div>
	
	<!-- Clients Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
		{#each filteredClients as client}
			<div class="enhanced-card p-6 rounded-xl">
				<!-- Client Header -->
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-start space-x-3">
						<div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
							<User class="h-6 w-6 text-primary" />
						</div>
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-foreground">{client.name}</h3>
							<div class="flex items-center space-x-2 mt-1">
								<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status || 'inactive')}`}>
									{client.status || 'inactive'}
								</span>
							</div>
						</div>
					</div>
					
					<div class="flex items-center space-x-2">
						<Button
							on:click={() => openClientDetails(client)}
							variant="outline"
							size="sm"
							class="glass-button p-1"
						>
							<Eye class="h-3 w-3" />
						</Button>
						<Button
							on:click={() => openEditClientModal(client)}
							variant="outline"
							size="sm"
							class="glass-button p-1"
						>
							<Edit class="h-3 w-3" />
						</Button>
					</div>
				</div>
				
				<!-- Contact Info -->
				<div class="space-y-2 mb-4">
					<div class="flex items-center space-x-2 text-sm">
						<Mail class="h-4 w-4 text-muted-foreground" />
						<span class="text-foreground truncate">{client.email}</span>
					</div>
					<div class="flex items-center space-x-2 text-sm">
						<Phone class="h-4 w-4 text-muted-foreground" />
						<span class="text-foreground">{client.phone}</span>
					</div>
					{#if client.lastVisit}
						<div class="flex items-center space-x-2 text-sm">
							<Calendar class="h-4 w-4 text-muted-foreground" />
							<span class="text-muted-foreground">Last visit: {formatDate(client.lastVisit)}</span>
						</div>
					{/if}
				</div>
				
				<!-- Preferences Preview -->
				<div class="mb-4">
					<h4 class="font-medium text-foreground mb-2">Preferences</h4>
					<div class="space-y-1 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Pressure:</span>
							<span class="text-foreground capitalize">{client.preferences.pressure}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Services:</span>
							<span class="text-foreground">{client.preferences.massageTypes.length}</span>
						</div>
						<div class="flex items-center space-x-3 text-xs">
							{#if client.preferences.music}
								<span class="text-green-600">♪ Music</span>
							{/if}
							{#if client.preferences.aromatherapy}
								<span class="text-purple-600">🌸 Aromatherapy</span>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Stats -->
				<div class="border-t border-border pt-4">
					<div class="flex justify-between items-center">
						<div class="text-center">
							<div class="text-lg font-bold text-primary">{formatPrice(client.totalSpent || 0)}</div>
							<div class="text-xs text-muted-foreground">Total Spent</div>
						</div>
						<div class="flex space-x-2">
							<Button
								on:click={() => toggleClientStatus(client.id)}
								variant="outline"
								size="sm"
								class="glass-button"
								disabled={isLoading}
							>
								{client.status === 'active' ? 'Deactivate' : 'Activate'}
							</Button>
							<Button
								on:click={() => handleDeleteClient(client.id)}
								variant="outline"
								size="sm"
								class="glass-button hover:bg-red-50 hover:border-red-200 hover:text-red-600"
								disabled={isLoading}
							>
								<Trash2 class="h-3 w-3" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	{#if filteredClients.length === 0}
		<div class="text-center py-12">
			<User class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-semibold text-foreground mb-2">No clients found</h3>
			<p class="text-muted-foreground">Try adjusting your filters or add a new client</p>
		</div>
	{/if}
</div>

<!-- Create Client Modal -->
{#if showCreateClientModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Add New Client</h2>
			</div>
			<form on:submit|preventDefault={() => {
				const massageTypesInputs = document.querySelectorAll('input[name="create-massage-types"]:checked');
				const massageTypes = Array.from(massageTypesInputs).map(input => input.value);
				
				handleCreateClient({
					name: document.getElementById('create-client-name')?.value,
					email: document.getElementById('create-client-email')?.value,
					phone: document.getElementById('create-client-phone')?.value,
					preferences: {
						massageTypes,
						pressure: document.getElementById('create-client-pressure')?.value || 'medium',
						temperature: document.getElementById('create-client-temperature')?.value || 'warm',
						music: document.getElementById('create-client-music')?.checked || false,
						aromatherapy: document.getElementById('create-client-aromatherapy')?.checked || false
					},
					medicalNotes: document.getElementById('create-client-notes')?.value
				});
			}}>
				<div class="p-6 space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="create-client-name" class="block text-sm font-medium text-foreground mb-2">Full Name</label>
							<input
								id="create-client-name"
								type="text"
								required
								placeholder="e.g., Anna Novakova"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						
						<div>
							<label for="create-client-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
							<input
								id="create-client-email"
								type="email"
								required
								placeholder="client@example.com"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div>
						<label for="create-client-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
						<input
							id="create-client-phone"
							type="tel"
							required
							placeholder="+420 123 456 789"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-foreground mb-2">Preferred Massage Types</label>
						<div class="grid grid-cols-2 gap-2">
							{#each ['Swedish Massage', 'Deep Tissue Massage', 'Hot Stone Massage', 'Relaxation Massage', 'Sports Massage', 'Aromatherapy Massage'] as type}
								<label class="flex items-center space-x-2">
									<input
										type="checkbox"
										name="create-massage-types"
										value={type}
										class="rounded border-border text-primary focus:ring-primary"
									/>
									<span class="text-sm text-foreground">{type}</span>
								</label>
							{/each}
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="create-client-pressure" class="block text-sm font-medium text-foreground mb-2">Pressure Preference</label>
							<select
								id="create-client-pressure"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="light">Light</option>
								<option value="medium" selected>Medium</option>
								<option value="firm">Firm</option>
							</select>
						</div>
						
						<div>
							<label for="create-client-temperature" class="block text-sm font-medium text-foreground mb-2">Temperature Preference</label>
							<select
								id="create-client-temperature"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="cool">Cool</option>
								<option value="neutral">Neutral</option>
								<option value="warm" selected>Warm</option>
								<option value="hot">Hot</option>
							</select>
						</div>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<label class="flex items-center space-x-2">
							<input
								id="create-client-music"
								type="checkbox"
								class="rounded border-border text-primary focus:ring-primary"
							/>
							<span class="text-sm text-foreground">Prefers music</span>
						</label>
						
						<label class="flex items-center space-x-2">
							<input
								id="create-client-aromatherapy"
								type="checkbox"
								class="rounded border-border text-primary focus:ring-primary"
							/>
							<span class="text-sm text-foreground">Prefers aromatherapy</span>
						</label>
					</div>
					
					<div>
						<label for="create-client-notes" class="block text-sm font-medium text-foreground mb-2">Medical Notes & Preferences</label>
						<textarea
							id="create-client-notes"
							placeholder="Any allergies, medical conditions, or special preferences..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
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
						Create Client
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Client Details Modal -->
{#if showClientDetails && selectedClient}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
							<User class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 class="text-2xl font-bold text-foreground">{selectedClient.name}</h2>
							<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedClient.status || 'inactive')}`}>
								{selectedClient.status || 'inactive'}
							</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="p-6 space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Contact Information -->
					<div class="space-y-4">
						<h3 class="font-semibold text-foreground">Contact Information</h3>
						<div class="space-y-3">
							<div class="flex items-center space-x-3">
								<Mail class="h-5 w-5 text-muted-foreground" />
								<span class="text-foreground">{selectedClient.email}</span>
							</div>
							<div class="flex items-center space-x-3">
								<Phone class="h-5 w-5 text-muted-foreground" />
								<span class="text-foreground">{selectedClient.phone}</span>
							</div>
							{#if selectedClient.lastVisit}
								<div class="flex items-center space-x-3">
									<Calendar class="h-5 w-5 text-muted-foreground" />
									<span class="text-foreground">Last visit: {formatDate(selectedClient.lastVisit)}</span>
								</div>
							{/if}
						</div>
					</div>
					
					<!-- Stats -->
					<div class="space-y-4">
						<h3 class="font-semibold text-foreground">Statistics</h3>
						<div class="grid grid-cols-1 gap-3">
							<div class="enhanced-card p-4 rounded-lg text-center">
								<div class="text-xl font-bold text-primary">{formatPrice(selectedClient.totalSpent || 0)}</div>
								<div class="text-sm text-muted-foreground">Total Spent</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Massage Preferences -->
				<div>
					<h3 class="font-semibold text-foreground mb-4">Massage Preferences</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 class="font-medium text-foreground mb-2">Preferred Services</h4>
							<div class="space-y-1">
								{#each selectedClient.preferences.massageTypes as type}
									<span class="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full mr-2 mb-1">
										{type}
									</span>
								{/each}
							</div>
						</div>
						
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Pressure:</span>
								<span class="font-medium text-foreground capitalize">{selectedClient.preferences.pressure}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Temperature:</span>
								<span class="font-medium text-foreground capitalize">{selectedClient.preferences.temperature}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Music:</span>
								<span class={`font-medium ${selectedClient.preferences.music ? 'text-green-600' : 'text-red-600'}`}>
									{selectedClient.preferences.music ? 'Yes' : 'No'}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Aromatherapy:</span>
								<span class={`font-medium ${selectedClient.preferences.aromatherapy ? 'text-green-600' : 'text-red-600'}`}>
									{selectedClient.preferences.aromatherapy ? 'Yes' : 'No'}
								</span>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Medical Notes -->
				{#if selectedClient.medicalNotes}
					<div>
						<h3 class="font-semibold text-foreground mb-2">Medical Notes & Special Requirements</h3>
						<div class="p-4 bg-accent/20 rounded-lg">
							<p class="text-foreground">{selectedClient.medicalNotes}</p>
						</div>
					</div>
				{/if}
			</div>
			
			<div class="p-6 border-t border-border flex justify-end space-x-3">
				<Button on:click={closeModals} variant="outline" class="glass-button">
					Close
				</Button>
				<Button on:click={() => { closeModals(); openEditClientModal(selectedClient!); }} class="glass-button">
					<Edit class="h-4 w-4 mr-2" />
					Edit Client
				</Button>
			</div>
		</div>
	</div>
{/if}
