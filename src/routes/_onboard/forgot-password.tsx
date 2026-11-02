import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import {
	AuthShell,
	Field,
	FormError,
	FormSuccess,
} from "#/components/auth/AuthShell.tsx";
import { authClient } from "#/packages/auth/auth-client.ts";

export const Route = createFileRoute("/_onboard/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setMessage("");

		const formData = new FormData(e.currentTarget);
		const email = String(formData.get("email") ?? "").trim();

		if (!email) {
			setError("Enter your email address.");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await authClient.requestPasswordReset({
				email,
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (result.error) {
				setError(result.error.message ?? "Could not send the reset email.");
				return;
			}

			setMessage(
				"If that email is registered, a reset link is on its way. Check your inbox.",
			);
		} catch (resetError) {
			setError(
				resetError instanceof Error
					? resetError.message
					: "Could not send the reset email.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Account recovery"
			title="Reset your password"
			subtitle="Enter the email address you use for school and we'll send a secure reset link."
			footer={
				<p>
					Remembered it?{" "}
					<Link
						to="/login"
						className="font-semibold text-red-600 hover:text-red-700"
					>
						Back to sign in
					</Link>
				</p>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<FormError message={error} />
				<FormSuccess message={message} />

				<Field
					label="Email address"
					type="email"
					name="email"
					autoComplete="email"
					placeholder="you@example.com"
					required
				/>

				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Mail className="h-4 w-4" />
					)}
					{isSubmitting ? "Sending…" : "Send reset link"}
				</button>
			</form>
		</AuthShell>
	);
}
