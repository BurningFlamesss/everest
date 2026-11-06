import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import { Input, Label, Textarea } from "#/components/ui/field.tsx";
import { submitContactMessageAction } from "#/packages/contact/server.ts";

export function ContactForm() {
	const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState("");
	const [openedAt, setOpenedAt] = useState(0);

	useEffect(() => {
		setOpenedAt(Date.now());
	}, []);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");

		const form = event.currentTarget;
		const data = new FormData(form);

		setStatus("sending");

		try {
			const result = await submitContactMessageAction({
				data: {
					name: String(data.get("name") ?? ""),
					email: String(data.get("email") ?? ""),
					phone: String(data.get("phone") ?? ""),
					subject: String(data.get("subject") ?? ""),
					message: String(data.get("message") ?? ""),
					website: String(data.get("website") ?? ""),
					formOpenedAt: openedAt || undefined,
				},
			});

			if (!result.success) {
				setError(result.error);
				setStatus("idle");
				return;
			}

			form.reset();
			setStatus("sent");
		} catch {
			setError("Could not send your message. Please try again.");
			setStatus("idle");
		}
	};

	return (
		<section
			id="enquiry"
			className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16 md:p-10"
		>
			<div className="max-w-2xl">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
					Send an enquiry
				</p>
				<h2 className="mt-2 font-display text-3xl font-bold text-foreground">
					Admissions, records or a campus visit
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Messages land in the school office inbox and are answered within one
					working day. You can also call or email us directly.
				</p>
			</div>

			{status === "sent" ? (
				<output className="mt-6 block rounded-lg border border-positive/30 bg-positive/10 px-4 py-3 text-sm text-positive">
					Thank you — your message has reached the school office.
				</output>
			) : (
				<form
					onSubmit={handleSubmit}
					className="mt-6 grid gap-4 md:grid-cols-2"
				>
					{error ? (
						<p
							role="alert"
							className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:col-span-2"
						>
							{error}
						</p>
					) : null}

					<div>
						<Label htmlFor="contact-name">Your name</Label>
						<Input
							id="contact-name"
							name="name"
							autoComplete="name"
							required
							minLength={2}
							maxLength={120}
						/>
					</div>
					<div>
						<Label htmlFor="contact-email">Email</Label>
						<Input
							id="contact-email"
							name="email"
							type="email"
							autoComplete="email"
							required
							maxLength={200}
						/>
					</div>
					<div>
						<Label htmlFor="contact-phone">Phone (optional)</Label>
						<Input
							id="contact-phone"
							name="phone"
							type="tel"
							autoComplete="tel"
							maxLength={40}
						/>
					</div>
					<div>
						<Label htmlFor="contact-subject">Subject</Label>
						<Input
							id="contact-subject"
							name="subject"
							required
							minLength={3}
							maxLength={160}
						/>
					</div>
					<div className="md:col-span-2">
						<Label htmlFor="contact-message">Message</Label>
						<Textarea
							id="contact-message"
							name="message"
							required
							minLength={10}
							maxLength={4000}
						/>
					</div>

					{/* Honeypot: hidden from people, filled by naive bots. */}
					<div className="hidden" aria-hidden="true">
						<label htmlFor="contact-website">Website</label>
						<input
							id="contact-website"
							name="website"
							tabIndex={-1}
							autoComplete="off"
						/>
					</div>

					<div className="md:col-span-2">
						<Button type="submit" disabled={status === "sending"}>
							{status === "sending" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
							{status === "sending" ? "Sending…" : "Send message"}
						</Button>
					</div>
				</form>
			)}
		</section>
	);
}
