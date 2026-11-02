import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthShell, Field, FormError } from "#/components/auth/AuthShell.tsx";
import { authClient } from "#/packages/auth/auth-client.ts";

export const Route = createFileRoute("/_onboard/login")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const password = String(formData.get("password") ?? "");

		if (!email || !password) {
			setError("Enter your email and password.");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});

			if (result.error) {
				setError(
					result.error.message ??
						"We could not sign you in. Check your email and password.",
				);
				return;
			}

			await navigate({ to: "/" });
		} catch (signInError) {
			setError(
				signInError instanceof Error
					? signInError.message
					: "Something went wrong while signing in.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Welcome back"
			title="Sign in to your account"
			subtitle="Use the email address and password you chose when activating your invitation."
			footer={
				<p>
					New to the school?{" "}
					<Link
						to="/signup"
						className="font-semibold text-red-600 hover:text-red-700"
					>
						Request an invitation
					</Link>
				</p>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<FormError message={error} />

				<Field
					label="Email address"
					type="email"
					name="email"
					autoComplete="email"
					placeholder="you@example.com"
					required
				/>

				<Field
					label="Password"
					type="password"
					name="password"
					autoComplete="current-password"
					placeholder="Your password"
					required
				/>

				<div className="flex justify-end">
					<Link
						to="/forgot-password"
						className="text-sm font-medium text-gray-600 hover:text-gray-900"
					>
						Forgot password?
					</Link>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<LogIn className="h-4 w-4" />
					)}
					{isSubmitting ? "Signing in…" : "Sign in"}
				</button>
			</form>
		</AuthShell>
	);
}
