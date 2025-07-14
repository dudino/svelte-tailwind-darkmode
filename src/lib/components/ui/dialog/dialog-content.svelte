<script>
  import { cn } from '$lib/utils';
  
  let className = '';
  export { className as class };
</script>

<div 
  class={cn(
    'bg-background border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
