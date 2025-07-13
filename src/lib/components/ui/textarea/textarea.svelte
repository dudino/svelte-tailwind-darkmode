<script lang="ts">
	import { type Events, type Props, textareaVariants } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let value: $$Props['value'] = '';
	export let placeholder: $$Props['placeholder'] = '';
	export let disabled: $$Props['disabled'] = false;
	export let readonly: $$Props['readonly'] = false;
	export let required: $$Props['required'] = false;
	export let name: $$Props['name'] = undefined;
	export let id: $$Props['id'] = undefined;
	export let rows: $$Props['rows'] = 4;
	export { className as class };
</script>

<textarea
	bind:value
	class={cn(textareaVariants({ variant, className }))}
	{placeholder}
	{disabled}
	{readonly}
	{required}
	{name}
	{id}
	{rows}
	{...$$restProps}
	on:input
	on:change
	on:focus
	on:blur
	on:keydown
	on:keyup
></textarea>
