import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
	AlertTriangle,
	CheckCircle2,
	Inbox,
	Mail,
	Phone,
	RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { PageHeader } from "#/components/common/PageHeader";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
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
			<div data-testid="inbox-page">
				<PageHeader
					eyebrow="Communications"
					title="Contact inbox"
					description="Enquiries sent through the public contact form."
					testId="inbox-page-header"
				/>
				<div className="panel">
					<ErrorState description={response.error} testId="inbox-error" />
				</div>
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
		<div data-testid="inbox-page">
			<PageHeader
				eyebrow="Communications"
				title="Contact inbox"
				description="Enquiries sent through the public contact form."
				meta={
					<span data-testid="inbox-open-count">
						{openCount} still {openCount === 1 ? "needs" : "need"} a reply
					</span>
				}
				testId="inbox-page-header"
			/>

			<div className="space-y-5">
				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="inbox-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}

				{messages.length === 0 ? (
					<div className="panel">
						<EmptyState
							icon={Inbox}
							title="No messages yet"
							description="Enquiries from the contact page appear here."
							testId="inbox-empty"
						/>
					</div>
				) : (
					<ul className="space-y-4">
						{messages.map((message) => (
							<li
								key={message.id}
								className="panel p-5"
								data-testid={`inbox-message-${message.id}`}
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="font-display text-base font-semibold text-foreground">
											{message.subject}
										</p>
										<p className="mt-0.5 text-sm text-muted-foreground">
											{message.name} ·{" "}
											<a
												href={`mailto:${message.email}`}
												className="inline-flex items-center gap-1 text-primary transition-colors duration-150 hover:underline focus-ring"
											>
												<Mail className="h-3.5 w-3.5" /> {message.email}
											</a>
											{message.phone ? (
												<a
													href={`tel:${message.phone.replace(/\s+/g, "")}`}
													className="ml-3 inline-flex items-center gap-1 text-primary transition-colors duration-150 hover:underline focus-ring"
												>
													<Phone className="h-3.5 w-3.5" /> {message.phone}
												</a>
											) : null}
										</p>
									</div>
									<StatusBadge
										value={message.status === "NEW" ? "pending" : "active"}
										label={message.status}
										testId={`inbox-status-${message.id}`}
									/>
								</div>

								<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
									{message.message}
								</p>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3 text-xs text-muted-foreground">
									<span className="num">
										{new Date(message.createdAt).toLocaleString()}
										{message.handledBy
											? ` · handled by ${message.handledBy.name}`
											: ""}
									</span>
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5"
										data-testid={`inbox-toggle-${message.id}`}
										onClick={() =>
											toggle(message.id, message.status !== "HANDLED")
										}
										disabled={pendingId === message.id}
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
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
