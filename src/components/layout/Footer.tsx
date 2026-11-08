import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useSchoolConfig, useSchoolContent } from "#/packages/school/hook.tsx";

const exploreLinks = [
	{ label: "Home", to: "/" },
	{ label: "About", to: "/about" },
	{ label: "Notices", to: "/notices" },
	{ label: "Events", to: "/events" },
	{ label: "Clubs", to: "/clubs" },
	{ label: "Gallery", to: "/gallery" },
	{ label: "Admissions", to: "/admissions" },
	{ label: "Contact", to: "/contact" },
	{ label: "Signup", to: "/signup" },
] as const;

/**
 * Shared marketing footer. Every public page uses this instead of its own
 * inline copy so contact details only live in `config.json`.
 */
export function Footer() {
	const config = useSchoolConfig();
	const { sidebar } = useSchoolContent();
	const year = new Date().getFullYear();

	if (!sidebar) return null;

	return (
		<footer className="bg-foreground pb-10 pt-20 text-background">
			<div className="mx-auto w-full max-w-6xl px-6 md:px-16">
				<div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
					<p className="text-[10px] uppercase tracking-[0.14em] text-background/60">
						Reach the Highest Point
					</p>
					<Link
						className="group inline-flex items-center gap-4 text-[clamp(38px,7vw,92px)] font-display leading-[0.95] no-underline"
						to="/contact"
					>
						<span>With {config.organization.shortName ?? "Everest"}</span>
						<ArrowUpRight className="h-10 w-10 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
					</Link>
				</div>

				<div className="mb-10 mt-12 h-px bg-background/20" />

				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr_1fr]">
					<div>
						<img
							src={sidebar.logo}
							alt={`${config.organization.name} logo`}
							className="max-h-20 w-auto object-contain"
						/>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
							{config.organization.tagline}
						</p>
					</div>

					<div className="flex flex-col gap-2.5 text-sm">
						<span className="mb-2 text-[9px] uppercase tracking-[0.12em] text-accent">
							Explore
						</span>
						{exploreLinks.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="text-background/80 no-underline transition-colors hover:text-accent"
							>
								{item.label}
							</Link>
						))}
					</div>

					<div className="flex flex-col gap-2.5 text-sm">
						<span className="mb-2 text-[9px] uppercase tracking-[0.12em] text-accent">
							School office
						</span>
						<a
							href={`mailto:${config.contact.email}`}
							className="inline-flex items-center gap-2 text-background/80 no-underline hover:text-accent"
						>
							<Mail className="h-3.5 w-3.5" /> {config.contact.email}
						</a>
						<a
							href={`tel:${config.contact.phone.replace(/\s+/g, "")}`}
							className="inline-flex items-center gap-2 text-background/80 no-underline hover:text-accent"
						>
							<Phone className="h-3.5 w-3.5" /> {config.contact.phone}
						</a>
						<p className="inline-flex items-start gap-2 text-background/60">
							<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							{config.contact.address ?? config.organization.address}
						</p>
						{config.socials?.map((social) => (
							<a
								key={social.href}
								href={social.href}
								target="_blank"
								rel="noreferrer"
								className="text-background/60 no-underline hover:text-accent"
							>
								{social.label}
							</a>
						))}
					</div>

					<div className="flex flex-col items-start justify-between gap-2 text-[10px] text-background/50">
						<span>SCMS / {config.organization.shortName ?? "Everest"}</span>
						<span>{year}</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
