import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Eye,
	EyeOff,
	KeyRound,
	LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "#/packages/auth/auth-client.ts";
import { Button } from "#/templates/modern/components/Button.tsx";
import {
	ImageReveal,
	SectionLabel,
} from "#/templates/modern/components/Editorial.tsx";
import { Input } from "#/templates/modern/components/Input.tsx";
import { Label } from "#/templates/modern/components/Label.tsx";

const VISUAL_IMAGE = "/schools/everest/landing-footage/frame_0001.jpeg";

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
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (!token) {
			setError(
				"This reset link is missing its security token. Please request a new password reset email.",
			);
			return;
		}

		const formData = new FormData(e.currentTarget);
		const newPassword = String(formData.get("newPassword") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");

		if (newPassword.length < 8) {
			setError("Password must contain at least 8 characters.");
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
				"Password successfully updated. You can now sign in with your new credentials.",
			);
			toast.success("Password updated successfully");

			setTimeout(() => {
				void navigate({ to: "/login" });
			}, 1400);
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
		<section
			className="auth-page overflow-x-hidden min-w-0"
			aria-labelledby="reset-title"
			data-testid="reset-password-page"
		>
			{/* Editorial Left Visual Panel */}
			<div className="auth-visual min-w-0">
				<ImageReveal
					src={VISUAL_IMAGE}
					alt="School architecture marking the entrance to Everest"
					eager
					testId="reset-visual-image"
				/>
				<div className="auth-visual__overlay">
					<SectionLabel number="04" inverse>
						Everest Credentials // Security
					</SectionLabel>
					<p>Reset Password.</p>
					<span>One community / connected responsibly</span>
				</div>
			</div>

			{/* Editorial Right Form Panel */}
			<div className="auth-panel">
				<Link
					to="/login"
					className="auth-back"
					data-testid="reset-back-login-link"
					style={{ color: "var(--c-black)" }}
				>
					<ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />
					Back to sign in
				</Link>

				<div className="auth-panel__inner">
					<span className="auth-kicker">ACCOUNT RECOVERY</span>
					<h1 id="reset-title" className="t-page-title text-foreground">
						Set a new password.
					</h1>
					<p className="auth-intro" style={{ color: "var(--c-black)" }}>
						Pick something you haven't used before. After updating, you will be
						prompted to sign in with your new credentials.
					</p>

					{error ? (
						<div
							role="alert"
							className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
							data-testid="reset-password-error"
						>
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
							<div>
								<p className="font-medium">{error}</p>
								{!token && (
									<Link
										to="/forgot-password"
										className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
									>
										Request a new reset link →
									</Link>
								)}
							</div>
						</div>
					) : null}

					{message ? (
						<div
							role="status"
							className="mb-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
							data-testid="reset-password-success"
						>
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
							<div>
								<p className="font-medium">{message}</p>
								<p className="mt-1 text-xs opacity-90">
									Redirecting to sign in…
								</p>
							</div>
						</div>
					) : null}

					<form
						onSubmit={handleSubmit}
						noValidate
						className="auth-form"
						data-testid="reset-password-form"
					>
						<div className="form-control">
							<Label
								htmlFor="newPassword"
								style={{ color: "var(--c-black)" }}
							>
								New password
							</Label>
							<div className="password-field">
								<Input
									id="newPassword"
									name="newPassword"
									type={showNewPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="At least 8 characters"
									minLength={8}
									required
									disabled={isSubmitting || Boolean(message)}
									className="editorial-input"
									data-testid="new-password-input"
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowNewPassword((value) => !value)}
									aria-label={
										showNewPassword ? "Hide password" : "Show password"
									}
									tabIndex={-1}
									style={{ color: "var(--c-red) !important" }}
								>
									{showNewPassword ? (
										<EyeOff aria-hidden="true" className="h-4 w-4" />
									) : (
										<Eye aria-hidden="true" className="h-4 w-4" />
									)}
								</button>
							</div>
							<p className="mt-1 text-[11px] text-muted-foreground">
								Use 8 or more characters with letters, numbers or symbols.
							</p>
						</div>

						<div className="form-control">
							<Label
								htmlFor="confirmPassword"
								style={{ color: "var(--c-black)" }}
							>
								Confirm new password
							</Label>
							<div className="password-field">
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="Repeat your new password"
									minLength={8}
									required
									disabled={isSubmitting || Boolean(message)}
									className="editorial-input"
									data-testid="confirm-password-input"
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowConfirmPassword((value) => !value)}
									aria-label={
										showConfirmPassword ? "Hide password" : "Show password"
									}
									tabIndex={-1}
									style={{ color: "var(--c-red) !important" }}
								>
									{showConfirmPassword ? (
										<EyeOff aria-hidden="true" className="h-4 w-4" />
									) : (
										<Eye aria-hidden="true" className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting || Boolean(message) || !token}
							className="institution-button institution-button--full"
							data-testid="reset-password-submit-button"
						>
							{isSubmitting ? (
								<LoaderCircle className="spin" aria-hidden="true" />
							) : (
								<KeyRound className="h-4 w-4" />
							)}
							{isSubmitting ? "Updating credentials…" : "Update password"}
						</Button>
					</form>

					<div className="auth-contact">
						<span style={{ color: "var(--c-black)" }}>
							Need help with access?
						</span>
						<Link
							to="/contact"
							style={{ color: "var(--c-red)", fontWeight: 500 }}
						>
							Contact the school office <span aria-hidden="true">→</span>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
