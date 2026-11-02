import {
	createFileRoute,
	notFound,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthShell, Field, FormError } from "#/components/auth/AuthShell.tsx";
import { authClient } from "#/packages/auth/auth-client.ts";
import { activateGuardianInvite } from "#/packages/auth/server/activate-guardian-invite.ts";
import { getGuardianInvite } from "#/packages/auth/server/get-guardian-invite.ts";

export const Route = createFileRoute("/_onboard/activate/guardian/$token")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" });
		}
	},
	loader: async ({ params }) => {
		const invite = await getGuardianInvite({ data: params.token });

		if (!invite || !invite.user) {
			throw notFound();
		}

		if (invite.usedAt) {
			throw new Error("INVITE_ALREADY_USED");
		}

		if (invite.expiresAt < new Date()) {
			throw new Error("INVITE_EXPIRED");
		}

		return invite;
	},
	notFoundComponent: () => (
		<AuthShell title="Invitation not found">
			<p className="text-sm text-gray-600">
				This guardian invitation link does not exist. Ask the school office to
				send a new one.
			</p>
		</AuthShell>
	),
	errorComponent: ({ error }) => (
		<AuthShell title="This link can't be used">
			<p className="text-sm text-gray-600">
				{error instanceof Error && error.message === "INVITE_ALREADY_USED"
					? "This invitation has already been used. Try signing in instead."
					: error instanceof Error && error.message === "INVITE_EXPIRED"
						? "This invitation has expired. Ask the school office for a new link."
						: "Something went wrong while loading this invitation."}
			</p>
		</AuthShell>
	),
	component: RouteComponent,
});

function RouteComponent() {
	const invite = Route.useLoaderData();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!invite.user) return null;

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
			const response = await activateGuardianInvite({
				data: { token: invite.token, password },
			});

			if (!response.success) {
				setError("We could not activate this account. Please try again.");
				return;
			}

			const signInRes = await authClient.signIn.email({
				email: response.email,
				password,
			});

			if (signInRes.error) {
				await navigate({ to: "/login" });
				return;
			}

			await navigate({ to: "/dashboard" });
		} catch (activationError) {
			const message =
				activationError instanceof Error ? activationError.message : "";

			setError(
				message === "INVITE_ALREADY_USED"
					? "This invitation has already been used."
					: message === "INVITE_EXPIRED"
						? "This invitation has expired."
						: message === "ACCOUNT_ALREADY_ACTIVATED"
							? "This account already has a password. Sign in instead."
							: "Something went wrong. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Guardian access"
			title={`Welcome, ${invite.user.name}`}
			subtitle={`Set a password to follow ${invite.student.user.name}'s school updates.`}
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
					<p className="mt-2 text-gray-600">
						Linked to {invite.student.user.name} as {invite.relation}.
					</p>
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
					{isSubmitting ? "Activating…" : "Activate guardian account"}
				</button>
			</form>
		</AuthShell>
	);
}
