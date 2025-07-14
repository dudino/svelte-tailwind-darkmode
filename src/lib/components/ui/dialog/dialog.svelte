<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { cn } from '$lib/utils';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let onOpenChange = (open) => {};

  let dialogElement;

  $: if (open !== undefined) {
    onOpenChange(open);
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      open = false;
      onOpenChange(false);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      open = false;
      onOpenChange(false);
    }
  }

  onMount(() => {
    const handleGlobalKeydown = (event) => {
      if (open && event.key === 'Escape') {
        open = false;
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  });
</script>

{#if open}
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    bind:this={dialogElement}
  >
    <slot />
  </div>
{/if}
