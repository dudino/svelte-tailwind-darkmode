import { type VariantProps, tv } from 'tailwind-variants';
import Root from './input.svelte';

const inputVariants = tv({
	base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		variant: {
			default: '',
			destructive: 'border-destructive focus-visible:ring-destructive'
		},
		size: {
			default: 'h-10',
			sm: 'h-9',
			lg: 'h-11'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

type Variant = VariantProps<typeof inputVariants>['variant'];
type Size = VariantProps<typeof inputVariants>['size'];

type Props = {
	class?: string;
	variant?: Variant;
	size?: Size;
	value?: string;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	name?: string;
	id?: string;
};

type Events = {
	input: Event & { currentTarget: EventTarget & HTMLInputElement };
	change: Event & { currentTarget: EventTarget & HTMLInputElement };
	focus: FocusEvent & { currentTarget: EventTarget & HTMLInputElement };
	blur: FocusEvent & { currentTarget: EventTarget & HTMLInputElement };
	keydown: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement };
	keyup: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement };
};

export {
	Root,
	type Props,
	type Events,
	inputVariants,
	Root as Input
};
