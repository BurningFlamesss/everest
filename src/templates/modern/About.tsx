import { Link } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BookOpen,
	FlaskConical,
	GraduationCap,
} from "lucide-react";
import { Footer } from "#/components/layout/Footer.tsx";
import { useSchoolConfig } from "#/packages/school/hook.tsx";

const facts = [
	{
		label: "Affiliation",
		value: "NEB, Nepal",
	},
	{
		label: "Levels",
		value: "School + Grade 11 & 12",
	},
	{
		label: "Streams",
		value: "Science and Management",
	},
	{
		label: "Campus",
		value: "Everest Building + Canon Building",
	},
];

const programmes = [
	{
		icon: GraduationCap,
		title: "School programme",
		description:
			"A structured curriculum from the early grades through secondary school, with continuous assessment and close mentoring.",
	},
	{
		icon: FlaskConical,
		title: "Science stream",
		description:
			"Physics, chemistry, biology and computer science supported by dedicated laboratories and project work.",
	},
	{
		icon: BookOpen,
		title: "Management stream",
		description:
			"Accounting, business studies, economics and computer applications for students aiming at commerce and management.",
	},
];

function About() {
	const config = useSchoolConfig();

	return (
		<main className="min-h-screen bg-background pl-0 md:ml-72">
			<section className="relative overflow-hidden bg-background px-6 py-20 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
					About the school
				</p>
				<h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
					Established in purpose.
					<br />
					Contemporary in outlook.
				</h1>
				<p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
					{config.organization.name} is a learning institution in Nepal built
					around a simple conviction: students thrive when expectations are
					clear, relationships are strong, and curiosity has room to become
					practice.
				</p>
			</section>

			<section className="grid gap-10 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:px-16">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						Our story
					</p>
					<h2 className="mt-3 font-display text-3xl font-bold text-foreground">
						A school rooted in its community
					</h2>
					<div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
						<p>
							Everest English Boarding Secondary School is affiliated to the
							National Examinations Board (NEB) of Nepal. It educates students
							at school level as well as at the +2 level in two streams: Science
							and Management.
						</p>
						<p>
							Our approach pairs a disciplined academic programme with the
							confidence that comes from sport, clubs, public speaking and
							service. Teachers know students by name, track their progress and
							work with families when support is needed.
						</p>
						<p>
							Two connected buildings, modern laboratories and a busy calendar
							of events give students the room to try things, make mistakes and
							build the habits that last beyond school.
						</p>
					</div>
				</div>

				<dl className="self-start rounded-2xl border border-border bg-muted p-6">
					{facts.map((fact) => (
						<div
							key={fact.label}
							className="border-b border-border py-4 last:border-b-0"
						>
							<dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
								{fact.label}
							</dt>
							<dd className="mt-1 font-semibold text-foreground">
								{fact.value}
							</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="bg-foreground px-6 py-16 text-background md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
					Programmes
				</p>
				<h2 className="mt-3 font-display text-3xl font-bold">
					Where curiosity becomes practice
				</h2>

				<div className="mt-8 grid gap-6 md:grid-cols-3">
					{programmes.map((programme) => (
						<article
							key={programme.title}
							className="rounded-2xl border border-background/10 bg-background/5 p-6"
						>
							<programme.icon className="h-7 w-7 text-accent" />
							<h3 className="mt-4 text-xl font-semibold">{programme.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-background/70">
								{programme.description}
							</p>
						</article>
					))}
				</div>
			</section>

			<section className="flex flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-end md:px-16">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						Visit or write to us
					</p>
					<h2 className="mt-3 max-w-xl font-display text-4xl font-bold text-foreground">
						Come and see the school for yourself.
					</h2>
				</div>
				<Link
					to="/contact"
					className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Contact the school <ArrowUpRight className="h-4 w-4" />
				</Link>
			</section>

			<Footer />
		</main>
	);
}

export default About;
