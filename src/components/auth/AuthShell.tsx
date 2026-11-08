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
		<main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-4 py-12 md:pl-72">
			<div className="w-full max-w-md">
				<Link
					to="/"
					className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
				>
					<ArrowLeft className="h-4 w-4" /> Back to the school
				</Link>

				<div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-black/5">
					{badge ? (
						<p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
							{badge}
						</p>
					) : null}
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{title}
					</h1>
					{subtitle ? (
						<p className="mt-2 text-sm leading-relaxed text-gray-500">
							{subtitle}
						</p>
					) : null}

					<div className="mt-7">{children}</div>
				</div>

				{footer ? (
					<div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
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
			<span className="mb-1.5 block text-sm font-medium text-gray-700">
				{label}
			</span>
			<input
				{...props}
				className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50"
			/>
		</label>
	);
}

export function FormError({ message }: { message?: string | null }) {
	if (!message) return null;

	return (
		<div
			role="alert"
			className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
		>
			{message}
		</div>
	);
}

export function FormSuccess({ message }: { message?: string | null }) {
	if (!message) return null;

	return (
		<output className="block rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700">
			{message}
		</output>
	);
}
