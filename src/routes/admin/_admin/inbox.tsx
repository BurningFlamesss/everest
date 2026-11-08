import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { CheckCircle2, Inbox, Mail, Phone, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
	getContactInboxFn,
	markContactMessageHandledAction,
} from "#/packages/contact/server.ts";

export const Route = createFileRoute("/admin/_admin/inbox")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_INBOX")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: () => getContactInboxFn({ data: {} }),
	component: InboxPage,
});

function InboxPage() {
	const response = Route.useLoaderData();
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState("");

	if (!response.success) {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
				{response.error}
			</div>
		);
	}

	const messages = response.messages;
	const openCount = messages.filter(
		(message) => message.status === "NEW",
	).length;

	const toggle = async (id: string, handled: boolean) => {
		setPendingId(id);
		setError("");

		try {
			const result = await markContactMessageHandledAction({
				data: { id, handled },
			});

			if (!result.success) {
				setError(result.error);
				return;
			}

			await router.invalidate();
		} finally {
			setPendingId(null);
		}
	};

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Contact inbox</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Enquiries sent through the public contact form. {openCount} still
						need a reply.
					</p>
				</div>
			</header>

			{error ? (
				<p
					role="alert"
					className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
				>
					{error}
				</p>
			) : null}

			{messages.length === 0 ? (
				<div className="rounded-2xl border border-border bg-card p-10 text-center">
					<Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-muted-foreground">
						No messages yet. Enquiries from the contact page appear here.
					</p>
				</div>
			) : (
				<ul className="space-y-4">
					{messages.map((message) => (
						<li
							key={message.id}
							className="rounded-2xl border border-border bg-card p-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="text-lg font-semibold text-foreground">
										{message.subject}
									</p>
									<p className="text-sm text-muted-foreground">
										{message.name} ·{" "}
										<a
											href={`mailto:${message.email}`}
											className="inline-flex items-center gap-1 text-primary hover:underline"
										>
											<Mail className="h-3.5 w-3.5" /> {message.email}
										</a>
										{message.phone ? (
											<a
												href={`tel:${message.phone.replace(/\s+/g, "")}`}
												className="ml-3 inline-flex items-center gap-1 text-primary hover:underline"
											>
												<Phone className="h-3.5 w-3.5" /> {message.phone}
											</a>
										) : null}
									</p>
								</div>
								<span
									className={
										message.status === "NEW"
											? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground"
											: "rounded-full bg-positive/15 px-2.5 py-1 text-xs font-semibold text-positive"
									}
								>
									{message.status}
								</span>
							</div>

							<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
								{message.message}
							</p>

							<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
								<span>
									{new Date(message.createdAt).toLocaleString()}
									{message.handledBy
										? ` · handled by ${message.handledBy.name}`
										: ""}
								</span>
								<button
									type="button"
									onClick={() =>
										toggle(message.id, message.status !== "HANDLED")
									}
									disabled={pendingId === message.id}
									className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-semibold text-foreground hover:bg-muted disabled:opacity-60"
								>
									{message.status === "HANDLED" ? (
										<>
											<RotateCcw className="h-3.5 w-3.5" /> Reopen
										</>
									) : (
										<>
											<CheckCircle2 className="h-3.5 w-3.5" /> Mark handled
										</>
									)}
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
