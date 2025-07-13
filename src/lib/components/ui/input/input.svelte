<script lang="ts">
	import { type Events, type Props, inputVariants } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let value: $$Props['value'] = '';
	export let placeholder: $$Props['placeholder'] = '';
	export let type: $$Props['type'] = 'text';
	export let disabled: $$Props['disabled'] = false;
	export let readonly: $$Props['readonly'] = false;
	export let required: $$Props['required'] = false;
	export let name: $$Props['name'] = undefined;
	export let id: $$Props['id'] = undefined;
	export { className as class };
</script>

<input
	bind:value
	class={cn(inputVariants({ variant, size, className }))}
	{type}
	{placeholder}
	{disabled}
	{readonly}
	{required}
	{name}
	{id}
	{...$$restProps}
	on:input
	on:change
	on:focus
	on:blur
	on:keydown
	on:keyup
/>
