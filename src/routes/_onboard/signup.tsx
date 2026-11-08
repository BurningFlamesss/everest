import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MailPlus } from "lucide-react";
import { useState } from "react";
import {
	AuthShell,
	Field,
	FormError,
	FormSuccess,
} from "#/components/auth/AuthShell.tsx";
import { requestInviteAction } from "#/packages/invite/requests-server.ts";

export const Route = createFileRoute("/_onboard/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const [submitted, setSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		const formData = new FormData(e.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const type = String(formData.get("type") ?? "STAFF") as "STAFF" | "STUDENT";
		const message = String(formData.get("message") ?? "").trim();

		if (!name || !email) {
			setError("Enter your name and email address.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await requestInviteAction({
				data: { name, email, type, message: message || undefined },
			});

			if (!response.success) {
				setError(response.error ?? "Could not submit your request.");
				return;
			}

			setSubmittedEmail(response.request.email);
			setSubmitted(true);
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "Could not submit your request.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			badge="Onboarding"
			title={submitted ? "Request received" : "Request an invitation"}
			subtitle={
				submitted
					? "A school administrator will review your request and email an activation link if approved."
					: "Tell us who needs access. An administrator reviews every request before an invitation is created."
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
			{submitted ? (
				<div className="space-y-4">
					<FormSuccess message="Your invitation request has been submitted." />

					<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
						<CheckCircle2 className="h-6 w-6 text-green-600" />
						<p className="mt-3 text-sm leading-relaxed text-gray-700">
							We have recorded the request for{" "}
							<span className="font-semibold text-gray-900">
								{submittedEmail}
							</span>
							. You do not need to do anything else — the school office will be
							in touch once your account is approved.
						</p>
					</div>

					<button
						type="button"
						onClick={() => {
							setSubmitted(false);
							setSubmittedEmail("");
						}}
						className="text-sm font-medium text-gray-600 hover:text-gray-900"
					>
						Submit another request
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

					<label className="block">
						<span className="mb-1.5 block text-sm font-medium text-gray-700">
							Message <span className="text-gray-400">(optional)</span>
						</span>
						<textarea
							name="message"
							rows={3}
							maxLength={1000}
							placeholder="Anything the school office should know…"
							className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
						/>
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
						{isSubmitting ? "Submitting request…" : "Request an invitation"}
					</button>
				</form>
			)}
		</AuthShell>
	);
}
