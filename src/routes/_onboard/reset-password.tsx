import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import {
	AuthShell,
	Field,
	FormError,
	FormSuccess,
} from "#/components/auth/AuthShell.tsx";
import { authClient } from "#/packages/auth/auth-client.ts";

interface ResetSearch {
	token?: string;
	error?: string;
}

export const Route = createFileRoute("/_onboard/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { token, error: queryError } = Route.useSearch();
	const navigate = useNavigate();
	const [error, setError] = useState(
		queryError ? "This reset link is invalid or has expired." : "",
	);
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (!token) {
			setError("This reset link is missing its token. Request a new email.");
			return;
		}

		const formData = new FormData(e.currentTarget);
		const newPassword = String(formData.get("newPassword") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");

		if (newPassword.length < 8) {
			setError("Use at least 8 characters for your new password.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("The two passwords do not match.");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await authClient.resetPassword({
				newPassword,
				token,
			});

			if (result.error) {
				setError(result.error.message ?? "Could not reset your password.");
				return;
			}

			setMessage(
				"Password updated. You can now sign in with your new password.",
			);

			setTimeout(() => {
				void navigate({ to: "/login" });
			}, 1200);
		} catch (resetError) {
			setError(
				resetError instanceof Error
					? resetError.message
					: "Could not reset your password.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Account recovery"
			title="Choose a new password"
			subtitle="Pick something you haven't used before. You'll be signed out of other sessions."
			footer={
				<p>
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
					label="New password"
					type="password"
					name="newPassword"
					autoComplete="new-password"
					placeholder="At least 8 characters"
					minLength={8}
					required
				/>
				<Field
					label="Confirm new password"
					type="password"
					name="confirmPassword"
					autoComplete="new-password"
					placeholder="Repeat your new password"
					minLength={8}
					required
				/>

				<button
					type="submit"
					disabled={isSubmitting || !token}
					className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<KeyRound className="h-4 w-4" />
					)}
					{isSubmitting ? "Updating…" : "Update password"}
				</button>
			</form>
		</AuthShell>
	);
}
