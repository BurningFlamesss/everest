import { createFileRoute } from "@tanstack/react-router";
import { MailX } from "lucide-react";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { PageHeader } from "#/components/common/PageHeader";
import { StatusBadge } from "#/components/common/StatusBadge";
import { getMailLogFn } from "#/packages/notifications/mail-log-server.ts";

export const Route = createFileRoute("/admin/_admin/mail")({
	loader: () => getMailLogFn(),
	component: AdminMail,
});

function AdminMail() {
	const response = Route.useLoaderData();

	return (
		<div data-testid="mail-page">
			<PageHeader
				eyebrow="System"
				title="Mail log"
				description="Every transactional email attempt is recorded here, including failures when SMTP is unconfigured or unreachable."
				testId="mail-page-header"
			/>

			{!response.success ? (
				<div className="panel">
					<ErrorState description={response.error} testId="mail-error" />
				</div>
			) : response.entries.length === 0 ? (
				<div className="panel">
					<EmptyState
						icon={MailX}
						title="No mail yet"
						description="No mail has been attempted yet. Invitation and notification emails will appear here."
						testId="mail-empty"
					/>
				</div>
			) : (
				<section className="panel overflow-hidden" data-testid="mail-log">
					<ul className="divide-y divide-hairline">
						{response.entries.map((entry) => (
							<li
								key={entry.id}
								className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
								data-testid={`mail-entry-${entry.id}`}
							>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground">
										{entry.subject}
									</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{entry.recipient} ·{" "}
										<span className="num">
											{new Date(entry.createdAt).toLocaleString()}
										</span>
									</p>
									{entry.error ? (
										<p className="mt-1 text-xs text-destructive">
											{entry.error}
										</p>
									) : null}
								</div>
								<StatusBadge
									value={entry.ok ? "succeeded" : "failed"}
									label={entry.ok ? "Sent" : "Failed"}
									testId={`mail-status-${entry.id}`}
								/>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
