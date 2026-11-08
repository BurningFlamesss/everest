import type {
	InputHTMLAttributes,
	LabelHTMLAttributes,
	TextareaHTMLAttributes,
} from "react";
import { cn } from "#/lib/utils.ts";

const controlClasses =
	"w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:bg-muted";

export function Input({
	className,
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(controlClasses, "min-h-32", className)}
			{...props}
		/>
	);
}

export function Label({
	className,
	htmlFor,
	children,
	...props
}: LabelHTMLAttributes<HTMLLabelElement> & { htmlFor: string }) {
	return (
		<label
			htmlFor={htmlFor}
			className={cn(
				"mb-1.5 block text-sm font-medium text-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</label>
	);
}
