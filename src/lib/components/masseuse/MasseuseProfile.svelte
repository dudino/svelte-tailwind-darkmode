<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { User, Camera, Edit3, Save, X, Star, Award, Calendar, MapPin, Phone, Mail, Globe, Clock, Users } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authStore } from '$lib/stores/auth';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	$: currentMasseuse = $masseuseData.find(m => m.email === $authStore.user?.email);
	
	let isEditing = false;
	let isLoading = false;
	let profileImage = currentMasseuse?.profileImage || null;
	
	// Editable profile data
	let editableProfile = {
		name: currentMasseuse?.name || '',
		email: currentMasseuse?.email || '',
		phone: currentMasseuse?.phone || '',
		bio: currentMasseuse?.bio || '',
		specializations: currentMasseuse?.specializations || [],
		languages: currentMasseuse?.languages || [],
		experience: currentMasseuse?.experience || '',
		certifications: currentMasseuse?.certifications || [],
		availability: currentMasseuse?.availability || {},
		hourlyRate: currentMasseuse?.hourlyRate || 0,
		location: currentMasseuse?.location || '',
		website: currentMasseuse?.website || '',
		instagram: currentMasseuse?.instagram || '',
		linkedin: currentMasseuse?.linkedin || ''
	};
	
	// Mock statistics
	let statistics = {
		totalClients: 127,
		totalSessions: 876,
		averageRating: 4.8,
		totalReviews: 94,
		experienceYears: 5,
		monthsAtAffinity: 18,
		totalRevenue: 2460000,
		certificationCount: 4,
		languageCount: 3,
		specializationCount: 5
	};
	
	// Mock recent reviews
	let recentReviews = [
		{
			id: '1',
			clientName: 'Sarah Johnson',
			rating: 5,
			comment: 'Absolutely amazing! Best massage I\'ve ever had. Very professional and skilled.',
			date: '2024-01-18',
			service: 'Deep Tissue Massage'
		},
		{
			id: '2',
			clientName: 'Michael Brown',
			rating: 5,
			comment: 'Perfect for my sports recovery. Knows exactly how to work with athletes.',
			date: '2024-01-17',
			service: 'Sports Massage'
		},
		{
			id: '3',
			clientName: 'Emma Wilson',
			rating: 4,
			comment: 'Very relaxing and professional. Will definitely book again.',
			date: '2024-01-16',
			service: 'Swedish Massage'
		}
	];
	
	// Available options
	const specializationOptions = [
		'Deep Tissue Massage', 'Swedish Massage', 'Sports Massage', 'Relaxation Massage',
		'Hot Stone Massage', 'Aromatherapy', 'Prenatal Massage', 'Thai Massage',
		'Reflexology', 'Trigger Point Therapy'
	];
	
	const languageOptions = [
		'English', 'Czech', 'German', 'French', 'Spanish', 'Italian', 'Russian', 'Polish'
	];
	
	const certificationOptions = [
		'Licensed Massage Therapist', 'Sports Massage Certification', 'Deep Tissue Certification',
		'Prenatal Massage Certification', 'Hot Stone Therapy', 'Aromatherapy Certification',
		'Thai Massage Certification', 'Reflexology Certification'
	];
	
	function toggleEdit() {
		if (isEditing) {
			// Reset to original values
			editableProfile = {
				name: currentMasseuse?.name || '',
				email: currentMasseuse?.email || '',
				phone: currentMasseuse?.phone || '',
				bio: currentMasseuse?.bio || '',
				specializations: currentMasseuse?.specializations || [],
				languages: currentMasseuse?.languages || [],
				experience: currentMasseuse?.experience || '',
				certifications: currentMasseuse?.certifications || [],
				availability: currentMasseuse?.availability || {},
				hourlyRate: currentMasseuse?.hourlyRate || 0,
				location: currentMasseuse?.location || '',
				website: currentMasseuse?.website || '',
				instagram: currentMasseuse?.instagram || '',
				linkedin: currentMasseuse?.linkedin || ''
			};
		}
		isEditing = !isEditing;
	}
	
	async function saveProfile() {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Update the masseuse data
			masseuseData.update(masseuses => 
				masseuses.map(m => 
					m.email === currentMasseuse?.email 
						? { ...m, ...editableProfile }
						: m
				)
			);
			
			isEditing = false;
		} catch (error) {
			console.error('Failed to save profile:', error);
		} finally {
			isLoading = false;
		}
	}
	
	function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				profileImage = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	
	function toggleSpecialization(spec: string) {
		if (editableProfile.specializations.includes(spec)) {
			editableProfile.specializations = editableProfile.specializations.filter(s => s !== spec);
		} else {
			editableProfile.specializations = [...editableProfile.specializations, spec];
		}
	}
	
	function toggleLanguage(lang: string) {
		if (editableProfile.languages.includes(lang)) {
			editableProfile.languages = editableProfile.languages.filter(l => l !== lang);
		} else {
			editableProfile.languages = [...editableProfile.languages, lang];
		}
	}
	
	function toggleCertification(cert: string) {
		if (editableProfile.certifications.includes(cert)) {
			editableProfile.certifications = editableProfile.certifications.filter(c => c !== cert);
		} else {
			editableProfile.certifications = [...editableProfile.certifications, cert];
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
	
	function formatCurrency(amount: number) {
		return `${amount.toLocaleString()} CZK`;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">My Profile</h1>
			<p class="text-sm text-muted-foreground">Manage your professional profile and settings</p>
		</div>
		
		<div class="flex gap-2">
			{#if isEditing}
				<Button
					on:click={saveProfile}
					class="glass-button"
					disabled={isLoading}
				>
					<Save class="h-4 w-4 mr-2" />
					{isLoading ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button
					on:click={toggleEdit}
					variant="outline"
					class="glass-button"
					disabled={isLoading}
				>
					<X class="h-4 w-4 mr-2" />
					Cancel
				</Button>
			{:else}
				<Button
					on:click={toggleEdit}
					class="glass-button"
				>
					<Edit3 class="h-4 w-4 mr-2" />
					Edit Profile
				</Button>
			{/if}
		</div>
	</div>
	
	<!-- Profile Header -->
	<div class="enhanced-card p-8 rounded-xl">
		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Profile Image -->
			<div class="flex-shrink-0 text-center">
				<div class="relative inline-block">
					<div class="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
						{#if profileImage}
							<img src={profileImage} alt="Profile" class="w-full h-full object-cover" />
						{:else}
							<User class="h-16 w-16 text-primary" />
						{/if}
					</div>
					{#if isEditing}
						<label class="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
							<Camera class="h-4 w-4 text-white" />
							<input
								type="file"
								accept="image/*"
								on:change={handleImageUpload}
								class="hidden"
							/>
						</label>
					{/if}
				</div>
			</div>
			
			<!-- Profile Info -->
			<div class="flex-1 space-y-4">
				{#if isEditing}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Name</label>
							<input
								bind:value={editableProfile.name}
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
								placeholder="Your full name"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Phone</label>
							<input
								bind:value={editableProfile.phone}
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
								placeholder="Phone number"
							/>
						</div>
					</div>
				{:else}
					<div>
						<h2 class="text-2xl font-bold text-foreground">{currentMasseuse?.name}</h2>
						<div class="flex items-center space-x-4 text-muted-foreground mt-2">
							<div class="flex items-center space-x-1">
								<Mail class="h-4 w-4" />
								<span>{currentMasseuse?.email}</span>
							</div>
							<div class="flex items-center space-x-1">
								<Phone class="h-4 w-4" />
								<span>{currentMasseuse?.phone}</span>
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Statistics -->
				<div class="grid grid-cols-3 md:grid-cols-6 gap-4 py-4 border-t border-border">
					<div class="text-center">
						<div class="text-lg font-bold text-primary">{statistics.totalClients}</div>
						<div class="text-xs text-muted-foreground">Clients</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-green-600">{statistics.totalSessions}</div>
						<div class="text-xs text-muted-foreground">Sessions</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-yellow-600">{statistics.averageRating}/5</div>
						<div class="text-xs text-muted-foreground">Rating</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-blue-600">{statistics.experienceYears}</div>
						<div class="text-xs text-muted-foreground">Years Exp.</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-purple-600">{statistics.monthsAtAffinity}</div>
						<div class="text-xs text-muted-foreground">Months Here</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-orange-600">{formatCurrency(statistics.totalRevenue)}</div>
						<div class="text-xs text-muted-foreground">Total Revenue</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Profile Details -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Professional Information -->
		<div class="enhanced-card p-6 rounded-xl">
			<h3 class="text-xl font-semibold text-foreground mb-4">Professional Information</h3>
			
			<div class="space-y-4">
				<!-- Bio -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-2">Bio</label>
					{#if isEditing}
						<textarea
							bind:value={editableProfile.bio}
							rows="4"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							placeholder="Tell clients about yourself..."
						></textarea>
					{:else}
						<p class="text-muted-foreground">
							{currentMasseuse?.bio || 'No bio available'}
						</p>
					{/if}
				</div>
				
				<!-- Experience -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-2">Experience</label>
					{#if isEditing}
						<textarea
							bind:value={editableProfile.experience}
							rows="3"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							placeholder="Describe your professional experience..."
						></textarea>
					{:else}
						<p class="text-muted-foreground">
							{currentMasseuse?.experience || 'No experience details available'}
						</p>
					{/if}
				</div>
				
				<!-- Hourly Rate -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-2">Hourly Rate</label>
					{#if isEditing}
						<div class="flex items-center space-x-2">
							<input
								bind:value={editableProfile.hourlyRate}
								type="number"
								min="0"
								class="flex-1 p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
								placeholder="Rate per hour"
							/>
							<span class="text-muted-foreground">CZK/hour</span>
						</div>
					{:else}
						<p class="text-foreground font-medium">
							{formatCurrency(currentMasseuse?.hourlyRate || 0)}/hour
						</p>
					{/if}
				</div>
				
				<!-- Location -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-2">Location</label>
					{#if isEditing}
						<input
							bind:value={editableProfile.location}
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							placeholder="Your location"
						/>
					{:else}
						<div class="flex items-center space-x-2 text-muted-foreground">
							<MapPin class="h-4 w-4" />
							<span>{currentMasseuse?.location || 'Location not specified'}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Specializations & Skills -->
		<div class="enhanced-card p-6 rounded-xl">
			<h3 class="text-xl font-semibold text-foreground mb-4">Specializations & Skills</h3>
			
			<div class="space-y-6">
				<!-- Specializations -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-3">Specializations</label>
					{#if isEditing}
						<div class="grid grid-cols-2 gap-2">
							{#each specializationOptions as spec}
								<label class="flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editableProfile.specializations.includes(spec)}
										on:change={() => toggleSpecialization(spec)}
										class="rounded border-border"
									/>
									<span class="text-sm text-foreground">{spec}</span>
								</label>
							{/each}
						</div>
					{:else}
						<div class="flex flex-wrap gap-2">
							{#each currentMasseuse?.specializations || [] as spec}
								<span class="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
									{spec}
								</span>
							{/each}
						</div>
					{/if}
				</div>
				
				<!-- Languages -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-3">Languages</label>
					{#if isEditing}
						<div class="grid grid-cols-2 gap-2">
							{#each languageOptions as lang}
								<label class="flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editableProfile.languages.includes(lang)}
										on:change={() => toggleLanguage(lang)}
										class="rounded border-border"
									/>
									<span class="text-sm text-foreground">{lang}</span>
								</label>
							{/each}
						</div>
					{:else}
						<div class="flex flex-wrap gap-2">
							{#each currentMasseuse?.languages || [] as lang}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
									{lang}
								</span>
							{/each}
						</div>
					{/if}
				</div>
				
				<!-- Certifications -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-3">Certifications</label>
					{#if isEditing}
						<div class="space-y-2">
							{#each certificationOptions as cert}
								<label class="flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editableProfile.certifications.includes(cert)}
										on:change={() => toggleCertification(cert)}
										class="rounded border-border"
									/>
									<span class="text-sm text-foreground">{cert}</span>
								</label>
							{/each}
						</div>
					{:else}
						<div class="space-y-2">
							{#each currentMasseuse?.certifications || [] as cert}
								<div class="flex items-center space-x-2">
									<Award class="h-4 w-4 text-yellow-600" />
									<span class="text-foreground">{cert}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Social & Contact -->
	<div class="enhanced-card p-6 rounded-xl">
		<h3 class="text-xl font-semibold text-foreground mb-4">Social & Contact</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Website</label>
				{#if isEditing}
					<input
						bind:value={editableProfile.website}
						class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						placeholder="Your website URL"
					/>
				{:else}
					{#if currentMasseuse?.website}
						<a
							href={currentMasseuse.website}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
						>
							<Globe class="h-4 w-4" />
							<span>Visit Website</span>
						</a>
					{:else}
						<span class="text-muted-foreground">No website</span>
					{/if}
				{/if}
			</div>
			
			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Instagram</label>
				{#if isEditing}
					<input
						bind:value={editableProfile.instagram}
						class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						placeholder="@username"
					/>
				{:else}
					{#if currentMasseuse?.instagram}
						<span class="text-foreground">{currentMasseuse.instagram}</span>
					{:else}
						<span class="text-muted-foreground">Not connected</span>
					{/if}
				{/if}
			</div>
			
			<div>
				<label class="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
				{#if isEditing}
					<input
						bind:value={editableProfile.linkedin}
						class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						placeholder="LinkedIn profile URL"
					/>
				{:else}
					{#if currentMasseuse?.linkedin}
						<span class="text-foreground">{currentMasseuse.linkedin}</span>
					{:else}
						<span class="text-muted-foreground">Not connected</span>
					{/if}
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Recent Reviews -->
	<div class="enhanced-card p-6 rounded-xl">
		<h3 class="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
			<Star class="h-5 w-5 text-yellow-500" />
			<span>Recent Reviews</span>
			<span class="text-sm text-muted-foreground">({statistics.totalReviews} total)</span>
		</h3>
		
		<div class="space-y-4">
			{#each recentReviews as review}
				<div class="p-4 bg-accent/10 rounded-lg border border-border/50">
					<div class="flex items-start justify-between mb-2">
						<div>
							<div class="font-medium text-foreground">{review.clientName}</div>
							<div class="text-sm text-muted-foreground">{review.service} • {formatDate(review.date)}</div>
						</div>
						<div class="flex items-center space-x-1">
							{#each Array(5) as _, i}
								<Star class={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
							{/each}
						</div>
					</div>
					<p class="text-foreground italic">"{review.comment}"</p>
				</div>
			{/each}
		</div>
	</div>
</div>
