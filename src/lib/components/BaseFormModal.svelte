<!--
  Base form modal component - reusable for create/edit forms across all pages
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  const dispatch = createEventDispatcher();

  export let show = false;
  export let title = '';
  export let isEditing = false;
  export let loading = false;
  export let error = '';
  export let submitLabel = '';
  export let icon: any = null;

  $: modalTitle = title || (isEditing ? 'Edit Item' : 'Create New Item');
  $: buttonLabel = submitLabel || (isEditing ? 'Update' : 'Create');

  function handleClose() {
    show = false;
    dispatch('close');
  }

  function handleSubmit() {
    dispatch('submit');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
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
          {#if icon}
            <svelte:component this={icon} class="h-5 w-5 text-primary" />
          {/if}
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

        <slot />
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
          {buttonLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}
