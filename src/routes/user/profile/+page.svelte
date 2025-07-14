<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { User, Phone, Mail, Calendar, Languages, Edit, Save, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State variables
	let isEditing = false;
	let loading = false;
	let formData = {
		name: '',
		phone: '',
		email: '',
		languages: [],
		contact_details: {}
	};

	// Languages options
	const languageOptions = [
		{ value: 'en', label: 'English' },
		{ value: 'cs', label: 'Czech' },
		{ value: 'ru', label: 'Russian' },
		{ value: 'de', label: 'German' },
		{ value: 'fr', label: 'French' },
		{ value: 'es', label: 'Spanish' }
	];

	// Initialize form data from current user
	function initializeForm() {
		if ($currentUser) {
			formData = {
				name: $currentUser.name || '',
				phone: $currentUser.phone || '',
				email: $currentUser.email || '',
				languages: $currentUser.languages || [],
				contact_details: $currentUser.contact_details || {}
			};
		}
	}

	// Toggle edit mode
	function toggleEdit() {
		if (isEditing) {
			// Cancel edit - reset form
			initializeForm();
		}
		isEditing = !isEditing;
	}

	// Save profile changes
	async function saveProfile() {
		loading = true;
		try {
			const pb = getPocketBaseClient();
			if (!pb || !$currentUser) throw new Error('Not authenticated');

			const updateData = {
				name: formData.name.trim(),
				phone: formData.phone.trim(),
				languages: formData.languages,
				contact_details: formData.contact_details
			};

			// Update user profile
			const updatedUser = await pb.collection('users').update($currentUser.id, updateData);
			
			// Update the store
			currentUser.set(updatedUser);
			
			isEditing = false;
			toast.success('Profile updated successfully');
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
		} finally {
			loading = false;
		}
	}

	// Toggle language selection
	function toggleLanguage(langValue) {
		if (formData.languages.includes(langValue)) {
			formData.languages = formData.languages.filter(l => l !== langValue);
		} else {
			formData.languages = [...formData.languages, langValue];
		}
	}

	// Get language label
	function getLanguageLabel(langValue) {
		return languageOptions.find(l => l.value === langValue)?.label || langValue;
	}

	// Format date for display
	function formatDate(dateStr) {
		if (!dateStr) return 'Not set';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	onMount(() => {
		initializeForm();
	});

	// Watch for user changes
	$: if ($currentUser && !isEditing) {
		initializeForm();
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold gradient-text">My Profile</h1>
			<p class="text-muted-foreground mt-1">
				Manage your personal information and preferences
			</p>
		</div>
		
		<div class="flex gap-2">
			{#if isEditing}
				<Button variant="outline" on:click={toggleEdit} disabled={loading}>
					<X class="h-4 w-4 mr-2" />
					Cancel
				</Button>
				<Button on:click={saveProfile} {loading}>
					<Save class="h-4 w-4 mr-2" />
					{loading ? 'Saving...' : 'Save'}
				</Button>
			{:else}
				<Button on:click={toggleEdit}>
					<Edit class="h-4 w-4 mr-2" />
					Edit Profile
				</Button>
			{/if}
		</div>
	</div>

	<!-- Profile Card -->
	<Card class="p-6">
		<div class="space-y-6">
			<!-- Avatar Section -->
			<div class="flex items-center space-x-4">
				<div class="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
					<User class="h-8 w-8 text-primary-foreground" />
				</div>
				<div>
					<h2 class="text-xl font-semibold">{$currentUser?.name || 'User'}</h2>
					<p class="text-muted-foreground capitalize">{$currentUser?.role || 'user'}</p>
					<Badge variant="outline" class="mt-1">
						{$currentUser?.is_active ? 'Active' : 'Inactive'}
					</Badge>
				</div>
			</div>

			<!-- Basic Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Basic Information</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						{#if isEditing}
							<Input
								id="name"
								bind:value={formData.name}
								placeholder="Enter your full name"
							/>
						{:else}
							<div class="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
								<User class="h-4 w-4 text-muted-foreground" />
								<span>{$currentUser?.name || 'Not set'}</span>
							</div>
						{/if}
					</div>

					<!-- Phone -->
					<div class="space-y-2">
						<Label for="phone">Phone Number</Label>
						{#if isEditing}
							<Input
								id="phone"
								bind:value={formData.phone}
								placeholder="Enter your phone number"
								type="tel"
							/>
						{:else}
							<div class="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
								<Phone class="h-4 w-4 text-muted-foreground" />
								<span>{$currentUser?.phone || 'Not set'}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Email (read-only) -->
				<div class="space-y-2">
					<Label for="email">Email Address</Label>
					<div class="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
						<Mail class="h-4 w-4 text-muted-foreground" />
						<span>{$currentUser?.email || 'Not set'}</span>
					</div>
					<p class="text-xs text-muted-foreground">
						Email cannot be changed from this interface
					</p>
				</div>
			</div>

			<!-- Languages -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Languages</h3>
				
				{#if isEditing}
					<div class="space-y-2">
						<Label>Select languages you speak</Label>
						<div class="flex flex-wrap gap-2">
							{#each languageOptions as lang}
								<Button
									variant={formData.languages.includes(lang.value) ? 'default' : 'outline'}
									size="sm"
									on:click={() => toggleLanguage(lang.value)}
									type="button"
								>
									{lang.label}
								</Button>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
						<Languages class="h-4 w-4 text-muted-foreground" />
						{#if $currentUser?.languages && $currentUser.languages.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each $currentUser.languages as lang}
									<Badge variant="secondary" class="text-xs">
										{getLanguageLabel(lang)}
									</Badge>
								{/each}
							</div>
						{:else}
							<span>No languages specified</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Account Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Account Information</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div class="space-y-2">
						<Label>Account Created</Label>
						<div class="flex items-center gap-2 p-2 bg-muted rounded-md">
							<Calendar class="h-4 w-4 text-muted-foreground" />
							<span>{formatDate($currentUser?.created)}</span>
						</div>
					</div>

					<div class="space-y-2">
						<Label>Last Login</Label>
						<div class="flex items-center gap-2 p-2 bg-muted rounded-md">
							<Calendar class="h-4 w-4 text-muted-foreground" />
							<span>{formatDate($currentUser?.last_login_at)}</span>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Accommodation Available</Label>
					<div class="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
						<Badge variant={$currentUser?.has_accommodation ? 'default' : 'secondary'}>
							{$currentUser?.has_accommodation ? 'Yes' : 'No'}
						</Badge>
					</div>
					<p class="text-xs text-muted-foreground">
						Contact administrator to change accommodation status
					</p>
				</div>
			</div>
		</div>
	</Card>
</div>
