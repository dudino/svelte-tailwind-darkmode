<script lang="ts">
	import { cn } from '$lib/utils';
	
	export let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
	export let size: 'default' | 'sm' | 'lg' = 'default';
	
	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
		outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
	};
	
	const sizes = {
		default: 'px-2.5 py-0.5 text-xs',
		sm: 'px-2 py-0 text-xs',
		lg: 'px-3 py-1 text-sm'
	};
</script>

<div 
	class={cn(
		'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants[variant],
		sizes[size],
		$$props.class
	)}
	{...$$restProps}
>
	<slot />
</div>
