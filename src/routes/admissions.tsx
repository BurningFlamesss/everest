import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	CalendarCheck,
	FileText,
	MessageSquare,
} from "lucide-react";
import { Footer } from "#/components/layout/Footer.tsx";
import { useSchoolConfig } from "#/packages/school/hook.tsx";
import { pageMeta } from "#/packages/school/meta.ts";

export const Route = createFileRoute("/admissions")({
	head: () =>
		pageMeta({
			title: "Admissions",
			description:
				"How to apply: enquire, visit the campus, submit documents and complete enrolment.",
		}),
	component: AdmissionsPage,
});

const steps = [
	{
		icon: MessageSquare,
		title: "1. Start an enquiry",
		body: "Send the contact form with your child's current grade and the year you are applying for.",
	},
	{
		icon: CalendarCheck,
		title: "2. Visit the campus",
		body: "The office arranges a tour and a short conversation with the year coordinator.",
	},
	{
		icon: FileText,
		title: "3. Submit documents",
		body: "Bring the previous report card, transfer certificate, birth certificate and photographs.",
	},
];

function AdmissionsPage() {
	const config = useSchoolConfig();

	return (
		<main className="min-h-screen bg-background pl-0 md:ml-72">
			<section className="px-6 py-20 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
					Admissions
				</p>
				<h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
					A place to begin.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
					Admissions are open for the coming academic year. The process is
					simple, and the school office will guide you at every step.
				</p>
				<Link
					to="/contact"
					className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
				>
					Send an enquiry <ArrowRight className="h-4 w-4" />
				</Link>
			</section>

			<section className="grid gap-5 px-6 md:grid-cols-3 md:px-16">
				{steps.map((step) => (
					<article
						key={step.title}
						className="rounded-2xl border border-border bg-card p-6"
					>
						<step.icon className="h-6 w-6 text-primary" />
						<h2 className="mt-4 text-lg font-semibold text-foreground">
							{step.title}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{step.body}
						</p>
					</article>
				))}
			</section>

			<section className="mx-6 my-16 rounded-2xl border border-border bg-card p-8 md:mx-16">
				<h2 className="font-display text-3xl font-bold text-foreground">
					Questions before you apply?
				</h2>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Call the office on {config.contact.phone} or email{" "}
					{config.contact.email}. We reply within one working day.
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						to="/contact"
						className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
					>
						Contact the office
					</Link>
					<Link
						to="/gallery"
						className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
					>
						See the campus
					</Link>
				</div>
			</section>

			<Footer />
		</main>
	);
}
