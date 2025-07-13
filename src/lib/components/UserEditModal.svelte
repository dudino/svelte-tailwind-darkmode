<!--
  User Edit Modal Component
  Modal for editing user details, languages, services, and contact information
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    isLoading, 
    updateUser
  } from '$lib/stores';
  import type { UpdateUserData } from '$lib/types/user';
  import { AVAILABLE_LANGUAGES, AVAILABLE_SERVICES } from '$lib/types/user';

  const dispatch = createEventDispatcher();

  export let editingUser: any = null;
  export let showUserForm = false;

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
      dispatch('userUpdated');
      closeModal();
    }
  }

  function closeModal() {
    showUserForm = false;
    editingUser = null;
    dispatch('close');
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

<!-- User Edit Modal -->
{#if showUserForm && editingUser}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div class="bg-background border-2 border-border rounded-2xl shadow-2xl backdrop-blur-md p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Edit User: {editingUser.name || editingUser.nickname || 'Unnamed'}
        </h2>
        <button 
          onclick={closeModal}
          aria-label="Close modal"
          class="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="edit-user-name" class="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input 
                id="edit-user-name" 
                bind:value={editingUser.name} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-user-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <input 
                id="edit-user-phone" 
                bind:value={editingUser.phone} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-user-role" class="block text-sm font-medium text-foreground mb-2">User Role</label>
              <select 
                id="edit-user-role" 
                bind:value={editingUser.role} 
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
                <option value="user">User</option>
                <option value="operator">Operator</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            
            <div class="flex flex-col justify-center space-y-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  bind:checked={editingUser.is_active} 
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Active User</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  bind:checked={editingUser.has_accommodation} 
                  type="checkbox"
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm font-medium text-foreground">Has Accommodation</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Languages -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Languages</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each AVAILABLE_LANGUAGES as lang}
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/40 transition-colors">
                <input 
                  type="checkbox" 
                  checked={editingUser.languages?.includes(lang.code)}
                  onchange={() => toggleLanguage(lang.code)}
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm text-foreground">{lang.name}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Services -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Services</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each AVAILABLE_SERVICES as service}
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/40 transition-colors">
                <input 
                  type="checkbox" 
                  checked={editingUser.services?.includes(service)}
                  onchange={() => toggleService(service)}
                  class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring">
                <span class="text-sm text-foreground">{service}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Contact Details -->
        <div class="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <h3 class="text-lg font-semibold text-foreground mb-4">Contact Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label for="edit-first-name" class="block text-sm font-medium text-foreground mb-2">First Name</label>
              <input 
                id="edit-first-name"
                bind:value={editingUser.contactDetails.firstName}
                placeholder="Enter first name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-last-name" class="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <input 
                id="edit-last-name"
                bind:value={editingUser.contactDetails.lastName}
                placeholder="Enter last name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-dob" class="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
              <input 
                id="edit-dob"
                bind:value={editingUser.contactDetails.dateOfBirth}
                type="date"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-id-number" class="block text-sm font-medium text-foreground mb-2">ID Number</label>
              <input 
                id="edit-id-number"
                bind:value={editingUser.contactDetails.idNumber}
                placeholder="Enter ID number"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-street" class="block text-sm font-medium text-foreground mb-2">Street Name</label>
              <input 
                id="edit-street"
                bind:value={editingUser.contactDetails.streetName}
                placeholder="Enter street name"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-house-number" class="block text-sm font-medium text-foreground mb-2">House Number</label>
              <input 
                id="edit-house-number"
                bind:value={editingUser.contactDetails.houseNumber}
                placeholder="Enter house number"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-postal-code" class="block text-sm font-medium text-foreground mb-2">Postal Code</label>
              <input 
                id="edit-postal-code"
                bind:value={editingUser.contactDetails.postalCode}
                placeholder="Enter postal code"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-city" class="block text-sm font-medium text-foreground mb-2">City</label>
              <input 
                id="edit-city"
                bind:value={editingUser.contactDetails.city}
                placeholder="Enter city"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
            
            <div>
              <label for="edit-country" class="block text-sm font-medium text-foreground mb-2">Country</label>
              <input 
                id="edit-country"
                bind:value={editingUser.contactDetails.country}
                placeholder="Enter country"
                class="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <button 
          onclick={closeModal}
          class="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all font-medium">
          Cancel
        </button>
        
        <button 
          onclick={handleUserUpdate}
          disabled={$isLoading}
          class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2">
          {#if $isLoading}
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Saving Changes...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
