import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Loader2, MailPlus } from "lucide-react";
import { useState } from "react";
import {
	AuthShell,
	Field,
	FormError,
	FormSuccess,
} from "#/components/auth/AuthShell.tsx";
import { createInvite } from "#/packages/auth/server/create-invite.ts";

export const Route = createFileRoute("/_onboard/signup")({
	component: RouteComponent,
});

interface InviteResult {
	token: string;
	url: string;
	type: string;
	expiresAt: Date | string;
}

function RouteComponent() {
	const [invite, setInvite] = useState<InviteResult | null>(null);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setInvite(null);

		const formData = new FormData(e.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const type = String(formData.get("type") ?? "STAFF") as "STAFF" | "STUDENT";

		if (!name || !email) {
			setError("Enter your name and email address.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await createInvite({ data: { name, email, type } });

			if (!response.success || !response.invite) {
				setError(response.error ?? "Could not create an invitation.");
				return;
			}

			setInvite(response.invite as InviteResult);
		} catch (inviteError) {
			setError(
				inviteError instanceof Error
					? inviteError.message
					: "Could not create an invitation.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const copyLink = async () => {
		if (!invite) return;

		try {
			await navigator.clipboard.writeText(invite.url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	return (
		<AuthShell
			badge="Onboarding"
			title={invite ? "Your activation link is ready" : "Request an invitation"}
			subtitle={
				invite
					? "Open the link below to choose a password and activate the account."
					: "Enter the details of the person who needs access. An administrator can also create invitations from the dashboard."
			}
			footer={
				<p>
					Already activated?{" "}
					<Link
						to="/login"
						className="font-semibold text-red-600 hover:text-red-700"
					>
						Sign in
					</Link>
				</p>
			}
		>
			{invite ? (
				<div className="space-y-4">
					<FormSuccess message="Invitation created successfully." />

					<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
							{invite.type === "STUDENT" ? "Student" : "Staff"} activation link
						</p>
						<p className="mt-2 break-all text-sm text-gray-800">{invite.url}</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={copyLink}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<Copy className="h-4 w-4" />
								)}
								{copied ? "Copied" : "Copy link"}
							</button>
							<Link
								to="/activate/$token"
								params={{ token: invite.token }}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
							>
								Open activation page
							</Link>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setInvite(null)}
						className="text-sm font-medium text-gray-600 hover:text-gray-900"
					>
						Create another invitation
					</button>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<FormError message={error} />

					<Field
						label="Full name"
						type="text"
						name="name"
						autoComplete="name"
						placeholder="Aarav Sharma"
						required
					/>
					<Field
						label="Email address"
						type="email"
						name="email"
						autoComplete="email"
						placeholder="you@example.com"
						required
					/>

					<label className="block">
						<span className="mb-1.5 block text-sm font-medium text-gray-700">
							Account type
						</span>
						<select
							name="type"
							className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
							defaultValue="STAFF"
						>
							<option value="STAFF">Staff</option>
							<option value="STUDENT">Student</option>
						</select>
					</label>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MailPlus className="h-4 w-4" />
						)}
						{isSubmitting ? "Creating invitation…" : "Generate activation link"}
					</button>
				</form>
			)}
		</AuthShell>
	);
}
