<script lang="ts">
	import { cn } from '$lib/utils';
</script>

<div 
	class={cn(
		'rounded-lg border bg-card text-card-foreground shadow-sm',
		$$props.class
	)}
	{...$$restProps}
>
	<slot />
</div>
