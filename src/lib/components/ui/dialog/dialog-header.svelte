<script>
  import { cn } from '$lib/utils';
  
  let className = '';
  export { className as class };
</script>

<div 
  class={cn('p-6 border-b border-border', className)}
  {...$$restProps}
>
  <slot />
</div>
