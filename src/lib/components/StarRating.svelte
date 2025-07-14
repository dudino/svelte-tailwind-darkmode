<!--
  Star rating display component - reusable for any rating display
-->
<script lang="ts">
  export let rating: number = 0;
  export let maxRating: number = 5;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showText: boolean = true;
  export let color: string = 'text-yellow-400';

  $: sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  $: textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  function renderStars(rating: number, maxRating: number): string {
    const fullStars = Math.floor(rating);
    const emptyStars = maxRating - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  }
</script>

<div class="flex items-center gap-2">
  <span class="{sizeClasses[size]} {color}">
    {renderStars(rating, maxRating)}
  </span>
  
  {#if showText}
    <span class="{textSizeClasses[size]} text-muted-foreground">
      ({rating}/{maxRating})
    </span>
  {/if}
</div>
