import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "#/components/contact/ContactForm.tsx";
import { Footer } from "#/components/layout/Footer.tsx";
import { useSchoolConfig } from "#/packages/school/hook.tsx";

function Contact() {
	const { contact, organization } = useSchoolConfig();

	return (
		<main className="min-h-screen bg-background pl-0 md:ml-72">
			<section className="px-6 py-20 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
					Contact
				</p>
				<h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
					Let&apos;s talk about your child&apos;s next step.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
					Admissions questions, academic records, transport or anything else —
					the school office is happy to help.
				</p>
			</section>

			<section className="grid gap-6 px-6 md:grid-cols-2 md:px-16">
				<a
					href={`mailto:${contact.email}`}
					className="group rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
				>
					<Mail className="h-7 w-7 text-primary" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
						Email
					</p>
					<p className="mt-1 break-all text-xl font-semibold text-foreground group-hover:text-primary">
						{contact.email}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						We reply within one working day.
					</p>
				</a>

				<a
					href={`tel:${contact.phone.replace(/\s+/g, "")}`}
					className="group rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
				>
					<Phone className="h-7 w-7 text-primary" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
						Phone
					</p>
					<p className="mt-1 text-xl font-semibold text-foreground group-hover:text-primary">
						{contact.phone}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Sunday to Friday, office hours.
					</p>
				</a>

				<div className="rounded-2xl border border-border bg-card p-7">
					<Clock className="h-7 w-7 text-primary" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
						Office hours
					</p>
					<dl className="mt-2 space-y-1 text-sm text-foreground">
						{(contact.hours ?? []).map((entry) => (
							<div key={entry.label} className="flex justify-between gap-4">
								<dt>{entry.label}</dt>
								<dd className="font-medium">{entry.value}</dd>
							</div>
						))}
					</dl>
				</div>

				<div className="rounded-2xl border border-border bg-card p-7">
					<MapPin className="h-7 w-7 text-primary" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
						Campus
					</p>
					<p className="mt-1 text-lg font-semibold text-foreground">
						{organization.name}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{contact.address ?? organization.address}
					</p>
				</div>
			</section>

			<ContactForm />

			<section className="mx-6 mt-10 overflow-hidden rounded-2xl border border-border bg-card md:mx-16">
				{contact.mapImage ? (
					<img
						src={contact.mapImage}
						alt="Map to the school campus"
						className="h-64 w-full object-cover"
					/>
				) : null}
				<div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
					<div>
						<h2 className="text-xl font-semibold text-foreground">
							Planning a visit?
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Call ahead so the office can arrange a member of staff to show you
							around.
						</p>
					</div>
					<a
						href={`mailto:${contact.email}?subject=Campus%20visit`}
						className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
					>
						Arrange a visit
					</a>
				</div>
			</section>

			<div className="mt-16">
				<Footer />
			</div>
		</main>
	);
}

export default Contact;
