import {
	createFileRoute,
	notFound,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthShell, Field, FormError } from "#/components/auth/AuthShell.tsx";
import { ERROR } from "#/lib/error.ts";
import { ERROR_CODES } from "#/lib/error-codes.ts";
import { authClient } from "#/packages/auth/auth-client.ts";
import { activateInvite } from "#/packages/auth/server/activate-invite.ts";
import { getInvite } from "#/packages/auth/server/get-invite.ts";

export const Route = createFileRoute("/_onboard/activate/$token")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" });
		}
	},
	loader: async ({ params }) => {
		const invite = await getInvite({
			data: params.token,
		});

		if (!invite) {
			throw notFound();
		}

		if (invite.usedAt) {
			throw new Error(ERROR.INVITATION_USED);
		}

		if (invite.expiresAt < new Date()) {
			throw new Error(ERROR.INVITATION_EXPIRED);
		}

		return invite;
	},
	notFoundComponent: () => {
		return (
			<AuthShell title="Invitation not found">
				<p className="text-sm text-gray-600">
					This invitation link does not exist. Ask an administrator to send a
					new one.
				</p>
			</AuthShell>
		);
	},
	errorComponent: ({ error }) => {
		const errorMessage = error instanceof Error ? error.message : "";
		const message =
			errorMessage === ERROR.INVITATION_USED
				? "This invitation has already been used. Try signing in instead."
				: errorMessage === ERROR.INVITATION_EXPIRED
					? "This invitation has expired. Ask an administrator for a new link."
					: "Something went wrong while loading this invitation.";

		return (
			<AuthShell title="This link can't be used">
				<p className="text-sm text-gray-600">{message}</p>
			</AuthShell>
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const invite = Route.useLoaderData();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		const formData = new FormData(e.currentTarget);
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");

		if (password.length < 8) {
			setError("Use at least 8 characters for your password.");
			return;
		}

		if (password !== confirmPassword) {
			setError("The two passwords do not match.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await activateInvite({
				data: {
					token: invite.token,
					password,
				},
			});

			if (!response.success) {
				setError("We could not activate this account. Please try again.");
				return;
			}

			const signInRes = await authClient.signIn.email({
				email: invite.user.email,
				password,
			});

			if (signInRes.error) {
				await navigate({ to: "/login" });
				return;
			}

			await navigate({ to: "/" });
		} catch (activationError) {
			const message =
				activationError instanceof Error ? activationError.message : "";

			if (message === ERROR_CODES.INVITE_ALREADY_USED) {
				setError("This invitation has already been used.");
			} else if (message === ERROR_CODES.INVITE_EXPIRED) {
				setError("This invitation has expired.");
			} else if (message === ERROR_CODES.ACCOUNT_ALREADY_ACTIVATED) {
				setError("This account already has a password. Sign in instead.");
			} else {
				setError("Something went wrong. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Activate account"
			title={`Welcome, ${invite.user.name}`}
			subtitle="Choose a password to finish setting up your account."
			footer={
				<p className="text-xs text-gray-500">
					This invitation expires{" "}
					{new Date(invite.expiresAt).toLocaleDateString(undefined, {
						dateStyle: "medium",
					})}
					.
				</p>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<FormError message={error} />

				<div className="rounded-xl bg-gray-50 p-4 text-sm">
					<p className="font-medium text-gray-900">{invite.user.name}</p>
					<p className="text-gray-500">{invite.user.email}</p>
				</div>

				<Field
					label="New password"
					type="password"
					name="password"
					autoComplete="new-password"
					placeholder="At least 8 characters"
					minLength={8}
					required
				/>
				<Field
					label="Confirm password"
					type="password"
					name="confirmPassword"
					autoComplete="new-password"
					placeholder="Repeat your password"
					minLength={8}
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
						<KeyRound className="h-4 w-4" />
					)}
					{isSubmitting ? "Activating…" : "Activate account"}
				</button>
			</form>
		</AuthShell>
	);
}
