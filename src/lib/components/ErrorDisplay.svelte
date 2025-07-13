<!--
  Error Display Component
  Shows error messages with dismissal functionality
-->

<script lang="ts">
  import { error } from '$lib/stores';
</script>

{#if $error}
  <div class="mb-6 p-4 bg-background border-2 border-destructive/40 text-destructive rounded-xl backdrop-blur-md shadow-xl">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">{$error}</span>
      </div>
      <button onclick={() => error.set('')} class="text-destructive hover:text-destructive/80 font-bold text-xl transition-colors">×</button>
    </div>
  </div>
{/if}
