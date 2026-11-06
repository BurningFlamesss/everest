import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "#/lib/utils.ts";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
	{
		variants: {
			variant: {
				primary: "bg-primary text-primary-foreground hover:bg-primary/90",
				secondary:
					"border border-border bg-card text-foreground hover:bg-muted",
				ghost: "text-foreground hover:bg-muted",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
			},
			size: {
				sm: "px-3 py-1.5 text-xs",
				md: "px-5 py-2.5",
				lg: "px-6 py-3",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export function Button({
	className,
	variant,
	size,
	type = "button",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>) {
	return (
		<button
			type={type}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
