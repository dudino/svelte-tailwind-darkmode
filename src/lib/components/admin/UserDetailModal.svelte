<!--
  User Detail Modal
  Modal for viewing detailed user information
-->

<script lang="ts">
  import { X, User, Mail, Phone, Shield, Globe, MapPin, Calendar } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let user: any = null;

  function handleClose() {
    show = false;
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getLanguageLabels(languages: string[] = []) {
    const langMap: Record<string, string> = {
      'cz': 'Czech',
      'en': 'English',
      'ru': 'Russian',
      'de': 'German',
      'sk': 'Slovak'
    };
    return languages.map(lang => langMap[lang] || lang).join(', ') || 'None';
  }
</script>

<!-- Modal Backdrop -->
{#if show && user}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-4">
          {#if user.avatar}
            <img 
              src={user.avatar} 
              alt={user.name || user.email}
              class="w-12 h-12 rounded-full object-cover"
            />
          {:else}
            <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-lg font-medium text-primary">
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          {/if}
          <div>
            <h2 class="text-xl font-semibold">{user.name || 'No name'}</h2>
            <p class="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <User class="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">User ID:</span>
                <span class="font-mono text-sm">{user.id}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Role:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getRoleBadgeClass(user.role)}">
                  {user.role}
                </span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(user.is_active)}">
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {#if user.phone}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Phone:</span>
                  <span>{user.phone}</span>
                </div>
              {/if}
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Languages:</span>
                <span>{getLanguageLabels(user.languages)}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Has Accommodation:</span>
                <span>{user.has_accommodation ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <!-- Contact Details -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <MapPin class="h-5 w-5 text-primary" />
              Contact Details
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              {#if user.contact_details?.firstName || user.contact_details?.lastName}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Full Name:</span>
                  <span>{user.contact_details.firstName} {user.contact_details.lastName}</span>
                </div>
              {/if}
              
              {#if user.contact_details?.dateOfBirth}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Date of Birth:</span>
                  <span>{new Date(user.contact_details.dateOfBirth).toLocaleDateString()}</span>
                </div>
              {/if}
              
              {#if user.contact_details?.idNumber}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">ID Number:</span>
                  <span class="font-mono text-sm">{user.contact_details.idNumber}</span>
                </div>
              {/if}
              
              {#if user.contact_details?.streetName || user.contact_details?.houseNumber}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Address:</span>
                  <span>{user.contact_details.streetName} {user.contact_details.houseNumber}</span>
                </div>
              {/if}
              
              {#if user.contact_details?.city || user.contact_details?.postalCode}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">City:</span>
                  <span>{user.contact_details.postalCode} {user.contact_details.city}</span>
                </div>
              {/if}
              
              {#if user.contact_details?.country}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Country:</span>
                  <span>{user.contact_details.country}</span>
                </div>
              {/if}
              
              {#if !user.contact_details || Object.values(user.contact_details).every(val => !val)}
                <p class="text-muted-foreground text-sm italic">No contact details provided</p>
              {/if}
            </div>
          </div>

          <!-- Account Information -->
          <div class="space-y-4 md:col-span-2">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Calendar class="h-5 w-5 text-primary" />
              Account Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created</div>
                <div class="text-sm">{formatDate(user.created)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div class="text-sm">{formatDate(user.updated)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Login</div>
                <div class="text-sm">{formatDate(user.last_login_at)}</div>
              </div>
            </div>
          </div>

          <!-- Services (if applicable) -->
          {#if user.services && user.services.length > 0}
            <div class="space-y-4 md:col-span-2">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <Shield class="h-5 w-5 text-primary" />
                Assigned Services
              </h3>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex flex-wrap gap-2">
                  {#each user.services as serviceId}
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                      Service: {serviceId}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Additional Information -->
          {#if user.created_by}
            <div class="space-y-4 md:col-span-2">
              <h3 class="text-lg font-semibold">Additional Information</h3>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Created By:</span>
                  <span class="font-mono text-sm">{user.created_by}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t">
        <Button on:click={handleClose}>
          Close
        </Button>
      </div>
    </div>
  </div>
{/if}
