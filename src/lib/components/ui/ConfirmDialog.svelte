<!--
  Confirm Dialog
  Reusable confirmation dialog component
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { AlertTriangle, X } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let title = 'Confirm Action';
  export let description = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  export let loading = false;

  const dispatch = createEventDispatcher();

  function handleCancel() {
    show = false;
    dispatch('cancel');
  }

  function handleConfirm() {
    dispatch('confirm');
  }
</script>

<!-- Modal Backdrop -->
{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-md" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center gap-3 p-6 pb-4">
        <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle class="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 class="text-lg font-semibold">{title}</h2>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pb-6">
        <p class="text-muted-foreground">{description}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 pt-0">
        <Button 
          variant="outline" 
          on:click={handleCancel} 
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button 
          variant={confirmVariant}
          on:click={handleConfirm} 
          disabled={loading}
        >
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {/if}
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}
