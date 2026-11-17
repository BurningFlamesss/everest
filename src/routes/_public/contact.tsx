import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	AlertCircle,
	Facebook,
	Instagram,
	Linkedin,
	Twitter,
	Youtube,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { rows, str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { school, departments as staticDepartments } from "#/lib/site";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { Input } from "#/templates/modern/components/Input";
import { Button } from "#/templates/modern/components/kit";
import { Label } from "#/templates/modern/components/Label";
import { Segmented } from "#/templates/modern/components/Segmented";
import type { BlockType } from "#/types";

const kathmandu = () =>
	new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Kathmandu",
		weekday: "long",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date());
export const Route = createFileRoute("/_public/contact")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "contact" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("contact");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as any;

	// CMS sections merged over defaults; contact details fall back to school data.
	const contactSection = {
		...sectionDefaults("contact_details"),
		...getSectionFields(cmsData?.blocks, "contact_details"),
	} as Record<string, unknown>;
	const hoursSection = {
		...sectionDefaults("office_hours"),
		...getSectionFields(cmsData?.blocks, "office_hours"),
	} as Record<string, unknown>;
	const mapSection = {
		...sectionDefaults("map"),
		...getSectionFields(cmsData?.blocks, "map"),
	} as Record<string, unknown>;
	const deptSection = {
		...sectionDefaults("department_list"),
		...getSectionFields(cmsData?.blocks, "department_list"),
	} as Record<string, unknown>;

	const phoneNtc = str(contactSection, "phone", "") || school.phoneNtc;
	const phoneNcell =
		str(contactSection, "secondaryPhone", "") || school.phoneNcell;
	const contactEmail = str(contactSection, "email", "") || school.email;
	const admissionsEmail =
		str(contactSection, "admissionsEmail", "") ||
		"admissions@everestbutwal.edu.np";
	const hoursNote = str(hoursSection, "note", "");
	const mapEmbed =
		str(mapSection, "embedUrl", "") ||
		"https://www.google.com/maps?q=Butwal-8+Sukkhanagar&output=embed";
	const mapLabel = str(mapSection, "label", "") || "Main Campus";
	const mapDirections = str(mapSection, "directions", "");
	const mapLat = str(mapSection, "latitude", "");
	const mapLng = str(mapSection, "longitude", "");
	const mapQuery = mapLat && mapLng ? `${mapLat},${mapLng}` : mapLabel;

	const weekdayHours = str(hoursSection, "weekdays", "") || "09:00–16:00";
	const weekHours: Array<[string, string]> = [
		["SUNDAY", str(hoursSection, "sunday", "") || "09:00–16:00"],
		["MONDAY", weekdayHours],
		["TUESDAY", weekdayHours],
		["WEDNESDAY", weekdayHours],
		["THURSDAY", weekdayHours],
		["FRIDAY", weekdayHours],
		["SATURDAY", str(hoursSection, "saturday", "") || "CLOSED"],
	];

	const social_linksSection = {
		...sectionDefaults("social_links"),
		...getSectionFields(cmsData?.blocks, "social_links"),
	} as Record<string, unknown>;

	const socialItems = (
		[
			{
				key: "facebook",
				label: "Facebook",
				icon: Facebook,
				href: str(
					social_linksSection,
					"facebook",
					"https://www.facebook.com/eebssbutwal",
				),
			},
			{
				key: "instagram",
				label: "Instagram",
				icon: Instagram,
				href: str(
					social_linksSection,
					"instagram",
					"https://instagram.com/everestbutwal",
				),
			},
			{
				key: "x",
				label: "X",
				icon: Twitter,
				href: str(social_linksSection, "x", ""),
			},
			{
				key: "youtube",
				label: "YouTube",
				icon: Youtube,
				href: str(
					social_linksSection,
					"youtube",
					"https://youtube.com/@everestbutwal",
				),
			},
			{
				key: "linkedin",
				label: "LinkedIn",
				icon: Linkedin,
				href: str(social_linksSection, "linkedin", ""),
			},
		] as { key: string; label: string; icon: typeof Facebook; href: string }[]
	).filter((item) => item.href !== "");

	const cmsDepts = rows(deptSection, "departments").map((d, i) => ({
		id: `dept-${i}`,
		name: str(d, "name"),
		contact: str(d, "contact"),
		email: str(d, "email"),
		hours: str(d, "hours"),
		phones: [] as string[],
	}));
	const departments = cmsDepts.length > 0 ? cmsDepts : staticDepartments;

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "contact",
				sectionType,
			},
			"*",
		);
	};

	const [route, setRoute] = useState("Admissions");
	const [time, setTime] = useState(kathmandu());
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [count, setCount] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setTime(kathmandu()), 60000);
		return () => clearInterval(id);
	}, []);
	const validate = (
		e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { id, value } = e.currentTarget;
		setErrors((x) => ({
			...x,
			[id]: value.trim() ? "" : "This field is required.",
		}));
	};
	return (
		<>
			<section className="content grid grid-cols-1 gap-10 border-t border-border py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-16">
				<aside className="flex min-w-0 flex-col items-start gap-3">
					<h1 className="t-page-title text-foreground">{school.name}</h1>
					<p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
						{str(contactSection, "address", "") || school.address}
					</p>
					<CmsSectionBox
						preview={preview}
						sectionType="office_hours"
						onSelect={onSelectSection}
						testId="cms-section-hit-office_hours"
					>
						<div className="mt-6 rounded-card border border-border bg-card p-5">
							<div className="flex flex-wrap items-center gap-2">
								<span
									data-testid="contact-open-state"
									className="u-label inline-flex items-center rounded-pill bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-dark"
								>
									Open today · {weekdayHours}
								</span>
								<span
									data-testid="kathmandu-time"
									className="u-label text-muted-foreground"
								>
									{time} · Asia/Kathmandu
								</span>
							</div>
							<div className="my-4 h-px bg-border" />
							<ul className="space-y-1.5">
								{weekHours.map(([day, hours]) => (
									<li key={day} className="flex justify-between text-sm">
										<span className="u-label text-muted-foreground">{day}</span>
										<span className="text-sm font-medium text-foreground">
											{hours}
										</span>
									</li>
								))}
							</ul>
							{hoursNote ? (
								<p
									data-testid="office-hours-note"
									className="mt-4 text-xs leading-relaxed text-muted-foreground"
								>
									{hoursNote}
								</p>
							) : null}
							<div className="my-4 h-px bg-border" />
							<CmsSectionBox
								preview={preview}
								sectionType="contact_details"
								onSelect={onSelectSection}
								testId="cms-section-hit-contact_details"
							>
								<ul className="space-y-1">
									<li>
										<a
											href={`tel:${phoneNtc}`}
											data-testid="contact-ntc-link"
											className="flex min-h-11 items-center justify-between text-sm hover:text-red-dark transition-colors"
										>
											<span className="u-label text-muted-foreground">NTC</span>
											<span className="font-medium text-foreground">
												{phoneNtc}
											</span>
										</a>
									</li>
									<li>
										<a
											href={`tel:${phoneNcell}`}
											data-testid="contact-ncell-link"
											className="flex min-h-11 items-center justify-between text-sm hover:text-red-dark transition-colors"
										>
											<span className="u-label text-muted-foreground">
												Ncell
											</span>
											<span className="font-medium text-foreground">
												{phoneNcell}
											</span>
										</a>
									</li>
									<li>
										<a
											href={`mailto:${contactEmail}`}
											data-testid="contact-email-link"
											className="flex min-h-11 items-center justify-between text-sm hover:text-red-dark transition-colors"
										>
											<span className="u-label text-muted-foreground">
												Email
											</span>
											<span className="font-medium text-foreground">
												{contactEmail}
											</span>
										</a>
									</li>
									<li>
										<a
											href={`mailto:${admissionsEmail}`}
											data-testid="contact-admissions-email-link"
											className="flex min-h-11 items-center justify-between text-sm hover:text-red-dark transition-colors"
										>
											<span className="u-label text-muted-foreground">
												Admissions
											</span>
											<span className="font-medium text-foreground">
												{admissionsEmail}
											</span>
										</a>
									</li>
									<li>
										<a
											href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str(contactSection, "address", "") || "Butwal-8, Sukkhanagar, Rupandehi, Nepal")}`}
											data-testid="contact-directions-link"
											className="inline-flex min-h-11 mt-2 items-center font-medium text-sm text-red-dark hover:text-red-dark/80 transition-colors"
										>
											Get directions{" "}
											<span className="ml-1 leading-none">↗</span>
										</a>
									</li>
								</ul>
							</CmsSectionBox>
						</div>
					</CmsSectionBox>
				</aside>
				<form
					onSubmit={(e) => e.preventDefault()}
					data-testid="contact-form"
					className="flex min-w-0 flex-col gap-5"
				>
					<h2 className="t-h2 text-foreground">Direct your enquiry</h2>
					<Segmented
						label="Direct your enquiry"
						options={[
							"Admissions",
							"Accounts",
							"Principal's Office",
							"General",
						].map((v) => ({ value: v, label: v }))}
						value={route}
						onChange={setRoute}
					/>
					<div className="flex flex-col gap-2">
						<Label htmlFor="contact-name" className="text-foreground">
							Full name
						</Label>
						<Input
							type="text"
							id="contact-name"
							name="name"
							onBlur={validate}
							aria-invalid={!!errors["contact-name"]}
							className="min-h-11 rounded-field border-border bg-background px-3 text-sm aria-invalid:border-destructive"
						/>
						{errors["contact-name"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-name"]}
							</p>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="contact-email" className="text-foreground">
							Email address
						</Label>
						<Input
							type="email"
							id="contact-email"
							name="email"
							onBlur={validate}
							aria-invalid={!!errors["contact-email"]}
							className="min-h-11 rounded-field border-border bg-background px-3 text-sm aria-invalid:border-destructive"
						/>
						{errors["contact-email"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-email"]}
							</p>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="contact-phone" className="text-foreground">
							Phone number
						</Label>
						<Input
							type="tel"
							id="contact-phone"
							name="phone"
							onBlur={validate}
							aria-invalid={!!errors["contact-phone"]}
							className="min-h-11 rounded-field border-border bg-background px-3 text-sm aria-invalid:border-destructive"
						/>
						{errors["contact-phone"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-phone"]}
							</p>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex w-full items-center justify-between gap-3">
							<Label htmlFor="contact-message" className="text-foreground">
								Message
							</Label>
							<span
								id="contact-message-count"
								data-testid="contact-message-count"
								className="u-label text-muted-foreground"
							>
								{count} / 600
							</span>
						</div>
						<textarea
							id="contact-message"
							name="message"
							maxLength={600}
							onBlur={validate}
							onChange={(e) => setCount(e.target.value.length)}
							data-testid="contact-message-input"
							aria-describedby="contact-message-count"
							className="min-h-[140px] w-full resize-y rounded-field border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
						/>
						{errors["contact-message"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-message"]}
							</p>
						)}
					</div>
					<Button
						type="submit"
						testId="contact-submit-button"
						className="mt-1 min-h-11 w-full rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
					>
						Send enquiry
					</Button>
					<p className="text-xs leading-relaxed text-muted-foreground">
						This preview validates the form but does not transmit messages.
					</p>
				</form>
			</section>
			<CmsSectionBox
				preview={preview}
				sectionType="map"
				onSelect={onSelectSection}
				testId="cms-section-hit-map"
			>
				<section
					className="content mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"
					aria-label={mapLabel}
					data-testid="school-map"
				>
					<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
						<h2 className="t-h2 text-foreground">{mapLabel}</h2>
						{mapDirections ? (
							<p className="text-sm text-muted-foreground">{mapDirections}</p>
						) : null}
					</div>
					<div className="overflow-hidden rounded-field border border-border">
						<iframe
							title={`${mapLabel} location map`}
							src={mapEmbed}
							width="100%"
							height="400"
							style={{ border: 0 }}
							allowFullScreen={true}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						></iframe>
					</div>
					{mapLat && mapLng ? (
						<p className="mt-3 text-sm text-muted-foreground">
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
								target="_blank"
								rel="noreferrer"
								className="inline-flex min-h-11 items-center gap-1 font-medium text-red-dark hover:text-red-dark/80 transition-colors"
							>
								Open in Google Maps{" "}
								<span className="text-base leading-none">↗</span>
							</a>
							<span className="ml-3 font-mono text-xs text-muted-foreground/70">
								{mapLat}, {mapLng}
							</span>
						</p>
					) : null}
				</section>
			</CmsSectionBox>
			<CmsSectionBox
				preview={preview}
				sectionType="department_list"
				onSelect={onSelectSection}
				testId="cms-section-hit-department_list"
			>
				<section className="content mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
					{str(deptSection, "eyebrow") ? (
						<p className="t-eyebrow mb-2">{str(deptSection, "eyebrow")}</p>
					) : null}
					<h2 className="t-h2 text-foreground">
						{str(deptSection, "title", "") || "Who to ask"}
					</h2>
					<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{departments.map((d) => (
							<article
								key={d.id}
								data-testid={`department-${d.id}`}
								className="rounded-xl border border-border bg-background p-5"
							>
								<p className="u-label text-red-dark">{d.name}</p>
								<h3 className="mt-1.5 text-lg font-semibold text-foreground">
									{d.contact}
								</h3>
								{d.email ? (
									<a
										href={`mailto:${d.email}`}
										className="inline-flex min-h-11 items-center text-sm text-red-dark hover:text-red-dark/80 transition-colors"
									>
										{d.email}
									</a>
								) : null}
								{d.hours ? (
									<p className="text-xs leading-relaxed text-muted-foreground">
										{d.hours}
									</p>
								) : null}
							</article>
						))}
					</div>
				</section>
			</CmsSectionBox>
			<CmsSectionBox
				preview={preview}
				sectionType="social_links"
				onSelect={onSelectSection}
				testId="cms-section-hit-contact-social_links"
			>
				<section className="content mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
					<p className="u-label mb-2 text-muted-foreground">Follow</p>
					<h2 className="t-h2 text-foreground">Follow the school</h2>
					{socialItems.length > 0 ? (
						<div className="flex flex-wrap gap-4">
							{socialItems.map((item) => (
								<a
									key={item.key}
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className="flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<item.icon className="h-4 w-4" />
									<span className="font-medium">{item.label}</span>
								</a>
							))}
						</div>
					) : preview ? (
						<p className="text-sm text-muted-foreground">
							Social links section — click to edit.
						</p>
					) : null}
				</section>
			</CmsSectionBox>
		</>
	);
}
