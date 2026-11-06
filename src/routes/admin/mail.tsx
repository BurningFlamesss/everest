import { createFileRoute } from "@tanstack/react-router";
import { MailCheck, MailX } from "lucide-react";
import { getMailLogFn } from "#/packages/notifications/mail-log-server.ts";

export const Route = createFileRoute("/admin/mail")({
	loader: () => getMailLogFn(),
	component: AdminMail,
});

function AdminMail() {
	const response = Route.useLoaderData();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Mail log</h1>
				<p className="mt-1 text-sm text-gray-500">
					Every transactional email attempt is recorded here, including failures
					when SMTP is unconfigured or unreachable.
				</p>
			</div>

			{!response.success ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{response.error}
				</div>
			) : response.entries.length === 0 ? (
				<p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
					No mail has been attempted yet.
				</p>
			) : (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
					<ul className="divide-y divide-gray-100">
						{response.entries.map((entry) => (
							<li
								key={entry.id}
								className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
							>
								<div className="min-w-0">
									<p className="font-medium text-gray-900">{entry.subject}</p>
									<p className="text-xs text-gray-500">
										{entry.recipient} ·{" "}
										{new Date(entry.createdAt).toLocaleString()}
									</p>
									{entry.error ? (
										<p className="mt-1 text-xs text-red-600">{entry.error}</p>
									) : null}
								</div>
								<span
									className={
										entry.ok
											? "inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"
											: "inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"
									}
								>
									{entry.ok ? (
										<MailCheck className="h-3 w-3" />
									) : (
										<MailX className="h-3 w-3" />
									)}
									{entry.ok ? "Sent" : "Failed"}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
