<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Search, Edit, Trash2, MapPin, Home, Settings } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Location, Room } from '$lib/types/masseuse';
	
	const dispatch = createEventDispatcher();
	
	let locations: Location[] = [
		{
			id: 'loc-1',
			name: 'Affinity Downtown',
			address: '123 Main Street, Prague 1, Czech Republic',
			rooms: [
				{ id: 'room-1', name: 'Rose Room', capacity: 1, amenities: ['Aromatherapy', 'Hot stones', 'Heated table'] },
				{ id: 'room-2', name: 'Lotus Room', capacity: 1, amenities: ['Music therapy', 'Dim lighting', 'Essential oils'] },
				{ id: 'room-3', name: 'Zen Room', capacity: 1, amenities: ['Essential oils', 'Heated table', 'Sound therapy'] }
			]
		},
		{
			id: 'loc-2',
			name: 'Affinity Wellness Center',
			address: '456 Wellness Avenue, Prague 2, Czech Republic',
			rooms: [
				{ id: 'room-4', name: 'Serenity Suite', capacity: 1, amenities: ['Jacuzzi', 'Steam room', 'Chromotherapy'] },
				{ id: 'room-5', name: 'Harmony Room', capacity: 1, amenities: ['Sound therapy', 'Color therapy', 'Meditation space'] }
			]
		}
	];
	
	let searchQuery = '';
	let showCreateLocationModal = false;
	let showEditLocationModal = false;
	let showCreateRoomModal = false;
	let showEditRoomModal = false;
	let selectedLocation: Location | null = null;
	let selectedRoom: Room | null = null;
	let selectedLocationForRoom: string = '';
	let isLoading = false;
	
	$: filteredLocations = locations.filter(location => {
		if (searchQuery && !location.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
			!location.address.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}
		return true;
	});
	
	$: totalRooms = locations.reduce((total, location) => total + location.rooms.length, 0);
	
	function openCreateLocationModal() {
		selectedLocation = null;
		showCreateLocationModal = true;
	}
	
	function openEditLocationModal(location: Location) {
		selectedLocation = location;
		showEditLocationModal = true;
	}
	
	function openCreateRoomModal(locationId: string = '') {
		selectedRoom = null;
		selectedLocationForRoom = locationId;
		showCreateRoomModal = true;
	}
	
	function openEditRoomModal(room: Room, locationId: string) {
		selectedRoom = room;
		selectedLocationForRoom = locationId;
		showEditRoomModal = true;
	}
	
	function closeModals() {
		showCreateLocationModal = false;
		showEditLocationModal = false;
		showCreateRoomModal = false;
		showEditRoomModal = false;
		selectedLocation = null;
		selectedRoom = null;
		selectedLocationForRoom = '';
	}
	
	async function handleCreateLocation(locationData: Partial<Location>) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newLocation: Location = {
				id: `loc-${Date.now()}`,
				name: locationData.name!,
				address: locationData.address!,
				rooms: []
			};
			
			locations = [...locations, newLocation];
			closeModals();
		} catch (error) {
			console.error('Failed to create location:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleUpdateLocation(locationData: Partial<Location>) {
		if (!selectedLocation) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			locations = locations.map(location => 
				location.id === selectedLocation!.id 
					? { ...location, ...locationData }
					: location
			);
			closeModals();
		} catch (error) {
			console.error('Failed to update location:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleDeleteLocation(locationId: string) {
		if (!confirm('Are you sure you want to delete this location? All rooms will be deleted as well.')) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			locations = locations.filter(location => location.id !== locationId);
		} catch (error) {
			console.error('Failed to delete location:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleCreateRoom(roomData: Partial<Room>) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newRoom: Room = {
				id: `room-${Date.now()}`,
				name: roomData.name!,
				capacity: roomData.capacity!,
				amenities: roomData.amenities!
			};
			
			locations = locations.map(location => 
				location.id === selectedLocationForRoom 
					? { ...location, rooms: [...location.rooms, newRoom] }
					: location
			);
			closeModals();
		} catch (error) {
			console.error('Failed to create room:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleUpdateRoom(roomData: Partial<Room>) {
		if (!selectedRoom) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			locations = locations.map(location => 
				location.id === selectedLocationForRoom 
					? { 
						...location, 
						rooms: location.rooms.map(room => 
							room.id === selectedRoom!.id 
								? { ...room, ...roomData }
								: room
						)
					}
					: location
			);
			closeModals();
		} catch (error) {
			console.error('Failed to update room:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleDeleteRoom(roomId: string, locationId: string) {
		if (!confirm('Are you sure you want to delete this room?')) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			locations = locations.map(location => 
				location.id === locationId 
					? { ...location, rooms: location.rooms.filter(room => room.id !== roomId) }
					: location
			);
		} catch (error) {
			console.error('Failed to delete room:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Location Management</h1>
			<p class="text-sm text-muted-foreground">Manage parlor locations and massage rooms</p>
		</div>
		
		<Button on:click={openCreateLocationModal} class="glass-button">
			<Plus class="h-4 w-4 mr-2" />
			Add New Location
		</Button>
	</div>
	
	<!-- Search -->
	<div class="relative max-w-md">
		<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
		<input
			type="text"
			placeholder="Search locations..."
			bind:value={searchQuery}
			class="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
		/>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-foreground">{locations.length}</div>
			<div class="text-sm text-muted-foreground">Total Locations</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-primary">{totalRooms}</div>
			<div class="text-sm text-muted-foreground">Total Rooms</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-green-600">{totalRooms}</div>
			<div class="text-sm text-muted-foreground">Available Rooms</div>
		</div>
	</div>
	
	<!-- Locations Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		{#each filteredLocations as location}
			<div class="enhanced-card p-6 rounded-xl">
				<!-- Location Header -->
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-start space-x-3">
						<div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
							<MapPin class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="text-lg font-semibold text-foreground">{location.name}</h3>
							<p class="text-sm text-muted-foreground">{location.address}</p>
						</div>
					</div>
					
					<div class="flex items-center space-x-2">
						<Button
							on:click={() => openEditLocationModal(location)}
							variant="outline"
							size="sm"
							class="glass-button"
						>
							<Edit class="h-3 w-3" />
						</Button>
						<Button
							on:click={() => handleDeleteLocation(location.id)}
							variant="outline"
							size="sm"
							class="glass-button hover:bg-red-50 hover:border-red-200 hover:text-red-600"
							disabled={isLoading}
						>
							<Trash2 class="h-3 w-3" />
						</Button>
					</div>
				</div>
				
				<!-- Rooms Section -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h4 class="font-medium text-foreground">Rooms ({location.rooms.length})</h4>
						<Button
							on:click={() => openCreateRoomModal(location.id)}
							variant="outline"
							size="sm"
							class="glass-button"
						>
							<Plus class="h-3 w-3 mr-1" />
							Add Room
						</Button>
					</div>
					
					{#if location.rooms.length > 0}
						<div class="space-y-2">
							{#each location.rooms as room}
								<div class="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
									<div class="flex items-center space-x-3">
										<div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
											<Home class="h-4 w-4 text-green-600" />
										</div>
										<div>
											<div class="font-medium text-foreground">{room.name}</div>
											<div class="text-xs text-muted-foreground">
												Capacity: {room.capacity} • {room.amenities.length} amenities
											</div>
											<div class="text-xs text-muted-foreground mt-1">
												{room.amenities.slice(0, 3).join(', ')}
												{#if room.amenities.length > 3}
													<span class="text-primary">+{room.amenities.length - 3} more</span>
												{/if}
											</div>
										</div>
									</div>
									
									<div class="flex items-center space-x-1">
										<Button
											on:click={() => openEditRoomModal(room, location.id)}
											variant="outline"
											size="sm"
											class="glass-button p-1"
										>
											<Edit class="h-3 w-3" />
										</Button>
										<Button
											on:click={() => handleDeleteRoom(room.id, location.id)}
											variant="outline"
											size="sm"
											class="glass-button p-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
											disabled={isLoading}
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-6 text-muted-foreground">
							<Home class="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p class="text-sm">No rooms in this location</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	
	{#if filteredLocations.length === 0}
		<div class="text-center py-12">
			<MapPin class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-semibold text-foreground mb-2">No locations found</h3>
			<p class="text-muted-foreground">Create your first location to get started</p>
		</div>
	{/if}
</div>

<!-- Create Location Modal -->
{#if showCreateLocationModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Add New Location</h2>
			</div>
			<form on:submit|preventDefault={() => handleCreateLocation({
				name: document.getElementById('create-location-name')?.value,
				address: document.getElementById('create-location-address')?.value
			})}>
				<div class="p-6 space-y-4">
					<div>
						<label for="create-location-name" class="block text-sm font-medium text-foreground mb-2">Location Name</label>
						<input
							id="create-location-name"
							type="text"
							required
							placeholder="e.g., Affinity Downtown"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-location-address" class="block text-sm font-medium text-foreground mb-2">Address</label>
						<textarea
							id="create-location-address"
							required
							placeholder="Full address including city and country"
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
						Create Location
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Location Modal -->
{#if showEditLocationModal && selectedLocation}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Edit Location</h2>
			</div>
			<form on:submit|preventDefault={() => handleUpdateLocation({
				name: document.getElementById('edit-location-name')?.value,
				address: document.getElementById('edit-location-address')?.value
			})}>
				<div class="p-6 space-y-4">
					<div>
						<label for="edit-location-name" class="block text-sm font-medium text-foreground mb-2">Location Name</label>
						<input
							id="edit-location-name"
							type="text"
							value={selectedLocation.name}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="edit-location-address" class="block text-sm font-medium text-foreground mb-2">Address</label>
						<textarea
							id="edit-location-address"
							value={selectedLocation.address}
							required
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
						Update Location
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Create Room Modal -->
{#if showCreateRoomModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Add New Room</h2>
			</div>
			<form on:submit|preventDefault={() => {
				const amenitiesText = document.getElementById('create-room-amenities')?.value || '';
				const amenities = amenitiesText.split(',').map(a => a.trim()).filter(a => a);
				
				handleCreateRoom({
					name: document.getElementById('create-room-name')?.value,
					capacity: parseInt(document.getElementById('create-room-capacity')?.value || '1'),
					amenities
				});
			}}>
				<div class="p-6 space-y-4">
					{#if !selectedLocationForRoom}
						<div>
							<label for="create-room-location" class="block text-sm font-medium text-foreground mb-2">Location</label>
							<select
								id="create-room-location"
								bind:value={selectedLocationForRoom}
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="">Select Location</option>
								{#each locations as location}
									<option value={location.id}>{location.name}</option>
								{/each}
							</select>
						</div>
					{/if}
					
					<div>
						<label for="create-room-name" class="block text-sm font-medium text-foreground mb-2">Room Name</label>
						<input
							id="create-room-name"
							type="text"
							required
							placeholder="e.g., Rose Room"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-room-capacity" class="block text-sm font-medium text-foreground mb-2">Capacity</label>
						<input
							id="create-room-capacity"
							type="number"
							min="1"
							value="1"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-room-amenities" class="block text-sm font-medium text-foreground mb-2">Amenities</label>
						<textarea
							id="create-room-amenities"
							placeholder="Enter amenities separated by commas (e.g., Aromatherapy, Hot stones, Heated table)"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
						<p class="text-xs text-muted-foreground mt-1">Separate multiple amenities with commas</p>
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
						Create Room
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Room Modal -->
{#if showEditRoomModal && selectedRoom}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Edit Room</h2>
			</div>
			<form on:submit|preventDefault={() => {
				const amenitiesText = document.getElementById('edit-room-amenities')?.value || '';
				const amenities = amenitiesText.split(',').map(a => a.trim()).filter(a => a);
				
				handleUpdateRoom({
					name: document.getElementById('edit-room-name')?.value,
					capacity: parseInt(document.getElementById('edit-room-capacity')?.value || '1'),
					amenities
				});
			}}>
				<div class="p-6 space-y-4">
					<div>
						<label for="edit-room-name" class="block text-sm font-medium text-foreground mb-2">Room Name</label>
						<input
							id="edit-room-name"
							type="text"
							value={selectedRoom.name}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="edit-room-capacity" class="block text-sm font-medium text-foreground mb-2">Capacity</label>
						<input
							id="edit-room-capacity"
							type="number"
							min="1"
							value={selectedRoom.capacity}
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="edit-room-amenities" class="block text-sm font-medium text-foreground mb-2">Amenities</label>
						<textarea
							id="edit-room-amenities"
							value={selectedRoom.amenities.join(', ')}
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
						<p class="text-xs text-muted-foreground mt-1">Separate multiple amenities with commas</p>
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
						Update Room
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
