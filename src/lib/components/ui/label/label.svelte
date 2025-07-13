<script lang="ts">
	import { type Props } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = Props;

	let className: $$Props['class'] = undefined;
	export let forValue: $$Props['for'] = undefined;
	export { className as class };
</script>

<label
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	for={forValue}
	{...$$restProps}
>
	<slot />
</label>
