import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
	title,
	subtitle,
	children,
	footer,
	badge,
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
	footer?: ReactNode;
	badge?: string;
}) {
	return (
		<main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[var(--paper)] px-4 py-12">
			<div className="w-full max-w-md">
				<Link
					to="/"
					className="auth-back mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-3.5 w-3.5 text-primary" /> Back to the school
				</Link>

				<div className="rounded-2xl border border-hairline bg-surface-1 p-8 shadow-xl shadow-black/5">
					{badge ? (
						<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
							{badge}
						</p>
					) : null}
					<h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{title}
					</h1>
					{subtitle ? (
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{subtitle}
						</p>
					) : null}

					<div className="mt-7">{children}</div>
				</div>

				{footer ? (
					<div className="mt-6 text-center text-xs text-muted-foreground">
						{footer}
					</div>
				) : null}
			</div>
		</main>
	);
}

export function Field({
	label,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-semibold tracking-wide text-foreground">
				{label}
			</span>
			<input
				{...props}
				className="w-full rounded-lg border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
			/>
		</label>
	);
}

export function FormError({ message }: { message?: string | null }) {
	if (!message) return null;

	return (
		<div
			role="alert"
			className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
		>
			{message}
		</div>
	);
}

export function FormSuccess({ message }: { message?: string | null }) {
	if (!message) return null;

	return (
		<output className="block rounded-lg border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-success">
			{message}
		</output>
	);
}
