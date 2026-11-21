import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Facebook,
	Instagram,
	Linkedin,
	Loader2,
	Twitter,
	Youtube,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { rows, str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { school, departments as staticDepartments } from "#/lib/site";
import { submitContactMessageAction } from "#/packages/contact/server.ts";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { pageMeta } from "#/packages/school/meta.ts";
import { Button } from "#/templates/modern/components/Button";
import { Input } from "#/templates/modern/components/Input";
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

/** Weekday name in Kathmandu, uppercased to match the week-hours rows. */
const kathmanduWeekday = () =>
	new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Kathmandu",
		weekday: "long",
	})
		.format(new Date())
		.toUpperCase();

const ROUTES = [
	"Admissions",
	"Accounts",
	"Principal's Office",
	"General",
] as const;
type EnquiryRoute = (typeof ROUTES)[number];
export const Route = createFileRoute("/_public/contact")({
	head: () =>
		pageMeta({
			title:
				"Contact Us & Campus Location | Everest English Boarding Secondary School (EEBSS)",
			description:
				"Contact Everest English Boarding Secondary School in Sukkhanagar, Butwal-8, Rupandehi, Nepal. Official telephone: +977-71-535962, email, visiting hours, and campus directions.",
			path: "/contact",
			keywords:
				"contact everest school, eebss phone number, everest school address, school in butwal contact, butwal school location",
		}),
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

	const [route, setRoute] = useState<EnquiryRoute>("Admissions");
	const [time, setTime] = useState(kathmandu());
	const [today, setToday] = useState(kathmanduWeekday);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [count, setCount] = useState(0);
	const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
	const [submitError, setSubmitError] = useState("");
	const [openedAt, setOpenedAt] = useState(0);
	useEffect(() => {
		setOpenedAt(Date.now());
		const id = setInterval(() => {
			setTime(kathmandu());
			setToday(kathmanduWeekday());
		}, 60000);
		return () => clearInterval(id);
	}, []);
	const validate = (
		e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { id, value } = e.currentTarget;
		const trimmed = value.trim();
		let message = "";
		if (!trimmed) {
			// Phone is optional; the rest are required.
			message = id === "contact-phone" ? "" : "This field is required.";
		} else if (id === "contact-message" && trimmed.length < 10) {
			message = "Tell us a little more — at least 10 characters.";
		}
		setErrors((x) => ({ ...x, [id]: message }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitError("");

		const form = event.currentTarget;
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		const phone = String(data.get("phone") ?? "").trim();
		const message = String(data.get("message") ?? "").trim();

		const next: Record<string, string> = {};
		if (name.length < 2) next["contact-name"] = "Enter your name.";
		if (!email) next["contact-email"] = "This field is required.";
		if (!message) next["contact-message"] = "This field is required.";
		else if (message.length < 10)
			next["contact-message"] =
				"Tell us a little more — at least 10 characters.";

		setErrors((current) => ({ ...current, ...next }));
		if (Object.keys(next).length > 0) {
			document.getElementById(Object.keys(next)[0])?.focus();
			return;
		}

		setStatus("sending");

		try {
			const result = await submitContactMessageAction({
				data: {
					name,
					email,
					phone: phone || undefined,
					subject: `Enquiry for ${route}`,
					message,
					website: String(data.get("website") ?? ""),
					formOpenedAt: openedAt || undefined,
				},
			});

			if (!result.success) {
				setSubmitError(result.error);
				setStatus("idle");
				return;
			}

			form.reset();
			setCount(0);
			setErrors({});
			setStatus("sent");
		} catch {
			setSubmitError("Could not send your message. Please try again.");
			setStatus("idle");
		}
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
							<span
								data-testid="kathmandu-time"
								className="u-label block text-muted-foreground"
							>
								{time} · Asia/Kathmandu
							</span>
							<div className="my-4 h-px bg-border" />
							<ul className="space-y-1.5">
								{weekHours.map(([day, hours]) => {
									const isToday = day === today;
									return (
										<li
											key={day}
											data-testid={isToday ? "contact-open-state" : undefined}
											aria-current={isToday ? "date" : undefined}
											className={`flex items-center justify-between gap-3 text-sm ${
												isToday ? "font-semibold text-red-dark" : ""
											}`}
										>
											<span className="flex items-center gap-1.5">
												<span
													aria-hidden="true"
													className={`h-1.5 w-1.5 shrink-0 rounded-full ${
														isToday ? "bg-red-dark" : "bg-transparent"
													}`}
												/>
												<span
													className={
														isToday
															? "u-label text-red-dark"
															: "u-label text-muted-foreground"
													}
												>
													{day}
												</span>
											</span>
											<span
												className={`text-sm ${
													isToday
														? "font-semibold text-red-dark"
														: "font-medium text-foreground"
												}`}
											>
												{hours}
											</span>
										</li>
									);
								})}
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
					onSubmit={handleSubmit}
					noValidate
					data-testid="contact-form"
					className="contact-form min-w-0"
				>
					<h2 className="t-h2 text-foreground">Direct your enquiry</h2>
					<Segmented
						label="Direct your enquiry"
						options={ROUTES.map((v) => ({ value: v, label: v }))}
						value={route}
						onChange={setRoute}
						className="mb-10"
					/>
					{/* Honeypot: hidden from people, filled by naive bots. */}
					<div className="hidden" aria-hidden="true">
						<label htmlFor="contact-website">Website</label>
						<input
							id="contact-website"
							name="website"
							tabIndex={-1}
							autoComplete="off"
						/>
					</div>
					<div
						className={`form-control ${errors["contact-name"] ? "form-control--error" : ""}`}
					>
						<Label htmlFor="contact-name" style={{ color: "var(--c-black)" }}>
							Full name
						</Label>
						<Input
							type="text"
							id="contact-name"
							name="name"
							autoComplete="name"
							maxLength={120}
							onBlur={validate}
							aria-invalid={!!errors["contact-name"]}
							className="editorial-input"
						/>
						{errors["contact-name"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-name"]}
							</p>
						)}
					</div>
					<div
						className={`form-control ${errors["contact-email"] ? "form-control--error" : ""}`}
					>
						<Label htmlFor="contact-email" style={{ color: "var(--c-black)" }}>
							Email address
						</Label>
						<Input
							type="email"
							id="contact-email"
							name="email"
							autoComplete="email"
							maxLength={200}
							onBlur={validate}
							aria-invalid={!!errors["contact-email"]}
							className="editorial-input"
						/>
						{errors["contact-email"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-email"]}
							</p>
						)}
					</div>
					<div
						className={`form-control ${errors["contact-phone"] ? "form-control--error" : ""}`}
					>
						<Label htmlFor="contact-phone" style={{ color: "var(--c-black)" }}>
							Phone number
						</Label>
						<Input
							type="tel"
							id="contact-phone"
							name="phone"
							autoComplete="tel"
							maxLength={40}
							onBlur={validate}
							aria-invalid={!!errors["contact-phone"]}
							className="editorial-input"
						/>
						{errors["contact-phone"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-phone"]}
							</p>
						)}
					</div>
					<div
						className={`form-control ${errors["contact-message"] ? "form-control--error" : ""}`}
					>
						<div className="label-line">
							<Label
								htmlFor="contact-message"
								style={{ color: "var(--c-black)" }}
							>
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
							aria-invalid={!!errors["contact-message"]}
							className="editorial-input w-full resize-y"
						/>
						{errors["contact-message"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-message"]}
							</p>
						)}
					</div>
					{submitError ? (
						<p role="alert" className="form-status form-status--error">
							<AlertCircle aria-hidden="true" />
							{submitError}
						</p>
					) : null}
					{status === "sent" ? (
						<output className="form-status form-status--success">
							<CheckCircle2 aria-hidden="true" />
							Thank you — your message is on its way to the school office. We
							reply within one working day.
						</output>
					) : (
						<>
							<Button
								type="submit"
								testId="contact-submit-button"
								className="institution-button institution-button--full"
								disabled={status === "sending"}
							>
								{status === "sending" ? (
									<>
										<Loader2
											className="h-4 w-4 animate-spin"
											aria-hidden="true"
										/>
										Sending…
									</>
								) : (
									"Send enquiry"
								)}
							</Button>
							<p className="contact-form__note">
								Goes to the school office inbox. We reply within one working
								day.
							</p>
						</>
					)}
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
				<section className="content my-12">
					<p className="u-label mb-2 text-muted-foreground">Follow</p>
					<h2 className="t-h2 text-foreground">Follow the school</h2>
					{socialItems.length > 0 ? (
						<div className="mt-4 flex flex-wrap gap-4">
							{socialItems.map((item) => (
								<a
									key={item.key}
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
