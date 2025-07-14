<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { toast } from 'svelte-sonner';
  import { operatorBookingsStore, operatorBookingsActions } from '$lib/stores/operator';

  const dispatch = createEventDispatcher();

  let creating = false;

  $: open = $operatorBookingsStore.showClientModal;
  $: formData = $operatorBookingsStore.newClientData;

  function updateFormData(field, value) {
    operatorBookingsActions.updateNewClientData({ [field]: value });
  }

  async function handleSubmit() {
    if (!formData.phone_number) {
      toast.error('Phone number is required');
      return;
    }

    if (!formData.channel) {
      updateFormData('channel', 'in_person');
    }

    creating = true;
    try {
      const newClient = await operatorBookingsActions.createClient(formData);
      toast.success('Client created successfully');
      handleClose();
      
      // Emit event to parent components if needed
      dispatch('clientCreated', newClient);
    } catch (error) {
      console.error('Client creation error:', error);
      toast.error('Failed to create client');
    }
    creating = false;
  }

  function handleClose() {
    operatorBookingsActions.hideClientModal();
  }

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'cs', label: 'Czech' },
    { value: 'ru', label: 'Russian' },
    { value: 'de', label: 'German' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' }
  ];

  const channelOptions = [
    { value: 'in_person', label: 'In Person' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' }
  ];
</script>

<Dialog bind:open onOpenChange={handleClose}>
  <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Create New Client</DialogTitle>
    </DialogHeader>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <!-- Required Fields -->
      <div class="space-y-4">
        <div>
          <Label for="phone_number">Phone Number *</Label>
          <Input
            id="phone_number"
            placeholder="+1 234 567 8900"
            value={formData.phone_number || ''}
            on:input={(e) => updateFormData('phone_number', e.target.value)}
            required
          />
        </div>

        <div>
          <Label for="channel">How did they find us? *</Label>
          <select 
            id="channel"
            class="w-full border border-border rounded-md px-3 py-2 bg-background"
            value={formData.channel || 'in_person'}
            on:change={(e) => updateFormData('channel', e.target.value)}
            required
          >
            {#each channelOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Optional Personal Information -->
      <div class="space-y-4">
        <h4 class="font-medium text-sm">Personal Information (Optional)</h4>
        
        <div>
          <Label for="nickname">Preferred Name/Nickname</Label>
          <Input
            id="nickname"
            placeholder="How they like to be called"
            value={formData.nickname || ''}
            on:input={(e) => updateFormData('nickname', e.target.value)}
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label for="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="John"
              value={formData.first_name || ''}
              on:input={(e) => updateFormData('first_name', e.target.value)}
            />
          </div>
          <div>
            <Label for="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              value={formData.last_name || ''}
              on:input={(e) => updateFormData('last_name', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email || ''}
            on:input={(e) => updateFormData('email', e.target.value)}
          />
        </div>

        <div>
          <Label for="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth || ''}
            on:input={(e) => updateFormData('date_of_birth', e.target.value)}
          />
        </div>

        <div>
          <Label for="preferred_language">Preferred Language</Label>
          <select 
            id="preferred_language"
            class="w-full border border-border rounded-md px-3 py-2 bg-background"
            value={formData.preferred_language || ''}
            on:change={(e) => updateFormData('preferred_language', e.target.value)}
          >
            <option value="">Select language</option>
            {#each languageOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <Label for="description">Notes/Description</Label>
          <Textarea
            id="description"
            placeholder="Any additional notes about the client..."
            value={formData.description || ''}
            on:input={(e) => updateFormData('description', e.target.value)}
            rows="3"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" on:click={handleClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating}>
          {#if creating}
            <div class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
          {/if}
          Create Client
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
