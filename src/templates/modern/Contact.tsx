import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useSchoolConfig } from "#/packages/school/hook.tsx";

function Contact() {
	const { contact, organization } = useSchoolConfig();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-20 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
					Contact
				</p>
				<h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.05] text-gray-900 md:text-7xl">
					Let&apos;s talk about your child&apos;s next step.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
					Admissions questions, academic records, transport or anything else —
					the school office is happy to help.
				</p>
			</section>

			<section className="grid gap-6 px-6 md:grid-cols-2 md:px-16">
				<a
					href={`mailto:${contact.email}`}
					className="group rounded-2xl border border-gray-200 bg-white p-7 transition-shadow hover:shadow-lg"
				>
					<Mail className="h-7 w-7 text-red-500" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
						Email
					</p>
					<p className="mt-1 break-all text-xl font-semibold text-gray-900 group-hover:text-red-600">
						{contact.email}
					</p>
					<p className="mt-2 text-sm text-gray-500">
						We reply within one working day.
					</p>
				</a>

				<a
					href={`tel:${contact.phone}`}
					className="group rounded-2xl border border-gray-200 bg-white p-7 transition-shadow hover:shadow-lg"
				>
					<Phone className="h-7 w-7 text-red-500" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
						Phone
					</p>
					<p className="mt-1 text-xl font-semibold text-gray-900 group-hover:text-red-600">
						{contact.phone}
					</p>
					<p className="mt-2 text-sm text-gray-500">
						Sunday to Friday, office hours.
					</p>
				</a>

				<div className="rounded-2xl border border-gray-200 bg-white p-7">
					<Clock className="h-7 w-7 text-red-500" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
						Office hours
					</p>
					<dl className="mt-2 space-y-1 text-sm text-gray-700">
						<div className="flex justify-between gap-4">
							<dt>Sunday – Thursday</dt>
							<dd className="font-medium">9:00 – 16:00</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt>Friday</dt>
							<dd className="font-medium">9:00 – 13:00</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt>Saturday</dt>
							<dd className="font-medium text-gray-400">Closed</dd>
						</div>
					</dl>
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-7">
					<MapPin className="h-7 w-7 text-red-500" />
					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
						Campus
					</p>
					<p className="mt-1 text-lg font-semibold text-gray-900">
						{organization.name}
					</p>
					<p className="mt-2 text-sm text-gray-500">Butwal, Rupandehi, Nepal</p>
				</div>
			</section>

			<section className="mx-6 mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white md:mx-16">
				<img
					src="/map.png"
					alt="Map to the school campus"
					className="h-64 w-full object-cover"
				/>
				<div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							Planning a visit?
						</h2>
						<p className="mt-1 text-sm text-gray-500">
							Call ahead so the office can arrange a member of staff to show you
							around.
						</p>
					</div>
					<a
						href={`mailto:${contact.email}?subject=Campus%20visit`}
						className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
					>
						Arrange a visit
					</a>
				</div>
			</section>
		</main>
	);
}

export default Contact;
