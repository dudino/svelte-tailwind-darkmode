<!--
  Client Form Modal
  Modal for creating/editing clients
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Users, Mail, Phone, MapPin, Calendar, User } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let client: any = null;

  const dispatch = createEventDispatcher();

  // Form data with proper typing
  let formData: {
    phone_number: string;
    channel: string;
    nickname: string;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    preferred_language: string;
    description: string;
    is_blocked: boolean;
    blocked_reason: string;
  } = {
    phone_number: '',
    channel: 'phone',
    nickname: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    preferred_language: '',
    description: '',
    is_blocked: false,
    blocked_reason: ''
  };

  let loading = false;
  let error = '';

  // Channel options
  const channelOptions = [
    { value: 'phone', label: 'Phone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'walk_in', label: 'Walk-in' }
  ];

  // Language options
  const languageOptions = [
    { value: '', label: 'Not specified' },
    { value: 'cz', label: 'Czech' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Russian' },
    { value: 'de', label: 'German' },
    { value: 'sk', label: 'Slovak' }
  ];

  // Reactive updates when client prop changes
  $: if (client) {
    formData = {
      phone_number: client.phone_number || '',
      channel: client.channel || 'phone',
      nickname: client.nickname || '',
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      date_of_birth: client.date_of_birth || '',
      preferred_language: client.preferred_language || '',
      description: client.description || '',
      is_blocked: client.is_blocked || false,
      blocked_reason: client.blocked_reason || ''
    };
  } else {
    // Reset form for new client
    formData = {
      phone_number: '',
      channel: 'phone',
      nickname: '',
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: '',
      preferred_language: '',
      description: '',
      is_blocked: false,
      blocked_reason: ''
    };
  }

  $: isEditing = !!client?.id;
  $: modalTitle = isEditing ? 'Edit Client' : 'Create New Client';

  function handleClose() {
    show = false;
    error = '';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.email?.trim()) {
        throw new Error('Email is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare client data
      const clientData = {
        name: formData.name?.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        emergency_contact_name: formData.emergency_contact_name?.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone?.trim() || null,
        medical_notes: formData.medical_notes?.trim() || null,
        preferences: formData.preferences?.trim() || null,
        status: formData.status,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('clients').update(client.id, clientData);
      } else {
        await pb.collection('clients').create(clientData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving client:', err);
    } finally {
      loading = false;
    }
  }
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
        <h2 id="modal-title" class="text-xl font-semibold flex items-center gap-2">
          <Users class="h-5 w-5 text-primary" />
          {modalTitle}
        </h2>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        {#if error}
          <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p class="text-destructive text-sm">{error}</p>
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Basic Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="name">Full Name</Label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name"
                    type="text"
                    bind:value={formData.name}
                    placeholder="Client's full name"
                    class="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label for="email">Email Address *</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    bind:value={formData.email}
                    placeholder="client@example.com"
                    class="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="phone">Phone Number</Label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone"
                    type="tel"
                    bind:value={formData.phone}
                    placeholder="+420 123 456 789"
                    class="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label for="status">Status</Label>
                <select 
                  id="status"
                  bind:value={formData.status}
                  class="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {#each statusOptions as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div>
              <Label for="address">Address</Label>
              <div class="relative">
                <MapPin class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  id="address"
                  bind:value={formData.address}
                  placeholder="Full address including city and postal code"
                  class="pl-10"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Personal Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="date_of_birth">Date of Birth</Label>
                <div class="relative">
                  <Calendar class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="date_of_birth"
                    type="date"
                    bind:value={formData.date_of_birth}
                    class="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label for="gender">Gender</Label>
                <select 
                  id="gender"
                  bind:value={formData.gender}
                  class="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {#each genderOptions as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Emergency Contact</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="emergency_contact_name">Contact Name</Label>
                <Input 
                  id="emergency_contact_name"
                  type="text"
                  bind:value={formData.emergency_contact_name}
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <Label for="emergency_contact_phone">Contact Phone</Label>
                <Input 
                  id="emergency_contact_phone"
                  type="tel"
                  bind:value={formData.emergency_contact_phone}
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Additional Information</h3>
            
            <div>
              <Label for="medical_notes">Medical Notes</Label>
              <Textarea 
                id="medical_notes"
                bind:value={formData.medical_notes}
                placeholder="Any medical conditions, allergies, or special considerations..."
                rows={3}
              />
            </div>

            <div>
              <Label for="preferences">Preferences</Label>
              <Textarea 
                id="preferences"
                bind:value={formData.preferences}
                placeholder="Client preferences for services, staff, room temperature, etc..."
                rows={3}
              />
            </div>
          </div>
        </div>
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
