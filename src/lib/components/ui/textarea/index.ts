import { type VariantProps, tv } from 'tailwind-variants';
import Root from './textarea.svelte';

const textareaVariants = tv({
	base: 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		variant: {
			default: '',
			destructive: 'border-destructive focus-visible:ring-destructive'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

type Variant = VariantProps<typeof textareaVariants>['variant'];

type Props = {
	class?: string;
	variant?: Variant;
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	name?: string;
	id?: string;
	rows?: number;
};

type Events = {
	input: Event & { currentTarget: EventTarget & HTMLTextAreaElement };
	change: Event & { currentTarget: EventTarget & HTMLTextAreaElement };
	focus: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement };
	blur: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement };
	keydown: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement };
	keyup: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement };
};

export {
	Root,
	type Props,
	type Events,
	textareaVariants,
	Root as Textarea
};
