<script>

	import Button from '$lib/components/ui/button/button.svelte';
	import { User, Mail, Phone, MapPin } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Profile - Dark Pink</title>
</svelte:head>

<div class="space-y-8">
	<section class="text-center py-8">
		<h1 class="text-4xl font-bold text-foreground mb-4">
			Profile
		</h1>
		<p class="text-xl text-muted-foreground mb-8">
			Manage your personal information and preferences
		</p>
	</section>

	<section class="max-w-2xl mx-auto">
		<div class="bg-card border border-border rounded-lg p-8">
			<!-- Profile Header -->
			<div class="flex flex-col items-center mb-8">
				<div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4">
					<User class="w-12 h-12 text-primary-foreground" />
				</div>
				<h2 class="text-2xl font-semibold text-foreground">John Doe</h2>
				<p class="text-muted-foreground">Professional Masseuse</p>
			</div>

			<!-- Profile Information -->
			<div class="space-y-6">
				<div class="flex items-center space-x-3 p-4 bg-accent rounded-lg">
					<Mail class="w-5 h-5 text-primary" />
					<div>
						<p class="font-medium text-foreground">Email</p>
						<p class="text-muted-foreground">john.doe@email.com</p>
					</div>
				</div>

				<div class="flex items-center space-x-3 p-4 bg-accent rounded-lg">
					<Phone class="w-5 h-5 text-primary" />
					<div>
						<p class="font-medium text-foreground">Phone</p>
						<p class="text-muted-foreground">+1 (555) 123-4567</p>
					</div>
				</div>

				<div class="flex items-center space-x-3 p-4 bg-accent rounded-lg">
					<MapPin class="w-5 h-5 text-primary" />
					<div>
						<p class="font-medium text-foreground">Location</p>
						<p class="text-muted-foreground">New York, NY</p>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-4 mt-8">
				<Button class="flex-1">Edit Profile</Button>
				<Button variant="outline" class="flex-1">Change Password</Button>
			</div>
		</div>
	</section>
</div>
