<!--
  User Form Modal
  Modal for creating/editing users in admin panel
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    X, 
    Save, 
    User, 
    Mail, 
    Phone, 
    Shield, 
    Globe,
    Upload,
    MapPin,
    Calendar,
    CreditCard
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { createUser, updateUser } from '$lib/stores/userManagementStore';
  import type { UserRole } from '$lib/types/user';
  import { formatDateForInput } from '$lib/utils/dateUtils';
  
  export let show = false;
  export let user: any = null;

  const dispatch = createEventDispatcher();

  // Form data with proper typing
  let formData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    languages: string[];
    is_active: boolean;
    has_accommodation: boolean;
    contact_details: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      idNumber: string;
      streetName: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      country: string;
    };
  } = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    languages: [],
    is_active: true,
    has_accommodation: false,
    contact_details: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      idNumber: '',
      streetName: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: ''
    }
  };

  let loading = false;
  let error = '';
  let activeTab = 'basic';

  // Available options
  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'operator', label: 'Operator' },
    { value: 'administrator', label: 'Administrator' }
  ];

  const languageOptions = [
    { value: 'cz', label: 'Czech' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Russian' },
    { value: 'de', label: 'German' },
    { value: 'sk', label: 'Slovak' }
  ];

  // Reactive updates when user prop changes
  $: if (user) {
    formData = {
      name: user.name || '',
      email: user.email || '',
      password: '', // Always empty for editing
      role: user.role || 'user',
      phone: user.phone || '',
      languages: user.languages || [],
      is_active: user.is_active !== false,
      has_accommodation: user.has_accommodation || false,
      contact_details: {
        firstName: user.contact_details?.firstName || '',
        lastName: user.contact_details?.lastName || '',
        dateOfBirth: formatDateForInput(user.contact_details?.dateOfBirth),
        idNumber: user.contact_details?.idNumber || '',
        streetName: user.contact_details?.streetName || '',
        houseNumber: user.contact_details?.houseNumber || '',
        postalCode: user.contact_details?.postalCode || '',
        city: user.contact_details?.city || '',
        country: user.contact_details?.country || ''
      }
    };
  } else {
    // Reset form for new user
    formData = {
      name: '',
      email: '',
      password: '',
      role: 'user',
      phone: '',
      languages: [],
      is_active: true,
      has_accommodation: false,
      contact_details: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        idNumber: '',
        streetName: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        country: ''
      }
    };
  }

  $: isEditing = !!user?.id;
  $: modalTitle = isEditing ? 'Edit User' : 'Create New User';

  function handleClose() {
    show = false;
    error = '';
    activeTab = 'basic';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function toggleLanguage(lang: string) {
    const index = formData.languages.indexOf(lang);
    if (index > -1) {
      formData.languages = formData.languages.filter(l => l !== lang);
    } else {
      formData.languages = [...formData.languages, lang];
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.email) {
        throw new Error('Email is required');
      }
      if (!isEditing && !formData.password) {
        throw new Error('Password is required for new users');
      }
      if (!formData.role) {
        throw new Error('Role is required');
      }

      // Prepare user data
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        languages: formData.languages,
        is_active: formData.is_active,
        has_accommodation: formData.has_accommodation,
        contact_details: formData.contact_details
      };

      // Add password for new users
      if (!isEditing && formData.password) {
        (userData as any).password = formData.password;
        (userData as any).passwordConfirm = formData.password;
      }

      if (isEditing) {
        await updateUser(user.id, userData);
      } else {
        await createUser(userData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving user:', err);
    } finally {
      loading = false;
    }
  }

  // Tab system
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'contact', label: 'Contact Details', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Shield }
  ];
</script>

<!-- Modal Backdrop -->
{#if show}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title"
    tabindex="-1"
    on:click={handleClose}
    on:keydown={handleBackdropKeydown}
  >
    <div 
      class="bg-card rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" 
      role="presentation"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 id="modal-title" class="text-xl font-semibold">{modalTitle}</h2>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Tabs -->
      <div class="border-b">
        <div class="flex px-6">
          {#each tabs as tab}
            <button
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors {
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }"
              on:click={() => activeTab = tab.id}
            >
              <svelte:component this={tab.icon} class="h-4 w-4" />
              {tab.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        {#if error}
          <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p class="text-destructive text-sm">{error}</p>
          </div>
        {/if}

        {#if activeTab === 'basic'}
          <div class="space-y-4">
            <!-- Name -->
            <div>
              <Label for="name">Name</Label>
              <Input 
                id="name"
                bind:value={formData.name}
                placeholder="Full name"
              />
            </div>

            <!-- Email -->
            <div>
              <Label for="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                bind:value={formData.email}
                placeholder="email@example.com"
                required
              />
            </div>

            <!-- Password (only for new users) -->
            {#if !isEditing}
              <div>
                <Label for="password">Password *</Label>
                <Input 
                  id="password"
                  type="password"
                  bind:value={formData.password}
                  placeholder="••••••••"
                  required
                />
              </div>
            {/if}

            <!-- Role -->
            <div>
              <Label for="role">Role *</Label>
              <select 
                id="role"
                bind:value={formData.role}
                class="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                {#each roleOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>

            <!-- Phone -->
            <div>
              <Label for="phone">Phone</Label>
              <Input 
                id="phone"
                bind:value={formData.phone}
                placeholder="+420 123 456 789"
              />
            </div>

            <!-- Languages -->
            <div>
              <Label>Languages</Label>
              <div class="flex flex-wrap gap-2 mt-2">
                {#each languageOptions as lang}
                  <button
                    type="button"
                    class="px-3 py-1 text-sm rounded-full border transition-colors {
                      formData.languages.includes(lang.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }"
                    on:click={() => toggleLanguage(lang.value)}
                  >
                    {lang.label}
                  </button>
                {/each}
              </div>
            </div>
          </div>

        {:else if activeTab === 'contact'}
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  bind:value={formData.contact_details.firstName}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label for="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  bind:value={formData.contact_details.lastName}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label for="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth"
                type="date"
                bind:value={formData.contact_details.dateOfBirth}
              />
            </div>

            <div>
              <Label for="idNumber">ID Number</Label>
              <Input 
                id="idNumber"
                bind:value={formData.contact_details.idNumber}
                placeholder="ID or passport number"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <Label for="streetName">Street Name</Label>
                <Input 
                  id="streetName"
                  bind:value={formData.contact_details.streetName}
                  placeholder="Street name"
                />
              </div>
              <div>
                <Label for="houseNumber">House Number</Label>
                <Input 
                  id="houseNumber"
                  bind:value={formData.contact_details.houseNumber}
                  placeholder="123"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode"
                  bind:value={formData.contact_details.postalCode}
                  placeholder="12345"
                />
              </div>
              <div>
                <Label for="city">City</Label>
                <Input 
                  id="city"
                  bind:value={formData.contact_details.city}
                  placeholder="City"
                />
              </div>
            </div>

            <div>
              <Label for="country">Country</Label>
              <Input 
                id="country"
                bind:value={formData.contact_details.country}
                placeholder="Country"
              />
            </div>
          </div>

        {:else if activeTab === 'settings'}
          <div class="space-y-4">
            <!-- Active Status -->
            <div class="flex items-center space-x-2">
              <input
                id="is_active"
                type="checkbox"
                bind:checked={formData.is_active}
                class="rounded"
              />
              <Label for="is_active">Active User</Label>
            </div>

            <!-- Has Accommodation -->
            <div class="flex items-center space-x-2">
              <input
                id="has_accommodation"
                type="checkbox"
                bind:checked={formData.has_accommodation}
                class="rounded"
              />
              <Label for="has_accommodation">Has Accommodation</Label>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t">
        <Button variant="outline" on:click={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button on:click={handleSubmit} disabled={loading}>
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
          {:else}
            <Save class="h-4 w-4 mr-2" />
          {/if}
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  </div>
{/if}
