<script>
  import { cn } from '$lib/utils';
  
  let className = '';
  export { className as class };
</script>

<h2 
  class={cn('text-2xl font-bold text-foreground', className)}
  {...$$restProps}
>
  <slot />
</h2>
