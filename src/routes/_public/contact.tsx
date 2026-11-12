
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { AlertCircle, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { departments as staticDepartments, school } from "#/lib/site";
import { Button } from "#/templates/modern/components/kit";
import { Segmented } from "#/templates/modern/components/Segmented";
import { Input } from "#/templates/modern/components/Input";
import { Label } from "#/templates/modern/components/Label";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str, rows } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
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
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("contact");
  const preview = String(cms ?? "") === "1";
  const cmsData = (preview ? previewPage : publishedContent) as any;

  // CMS sections merged over defaults; contact details fall back to school data.
  const contactSection = { ...sectionDefaults("contact_details"), ...getSectionFields(cmsData?.blocks, "contact_details") } as Record<string, unknown>;
  const hoursSection = { ...sectionDefaults("office_hours"), ...getSectionFields(cmsData?.blocks, "office_hours") } as Record<string, unknown>;
  const mapSection = { ...sectionDefaults("map"), ...getSectionFields(cmsData?.blocks, "map") } as Record<string, unknown>;
  const deptSection = { ...sectionDefaults("department_list"), ...getSectionFields(cmsData?.blocks, "department_list") } as Record<string, unknown>;

  const phoneNtc = str(contactSection, "phone", "") || school.phoneNtc;
  const phoneNcell = str(contactSection, "secondaryPhone", "") || school.phoneNcell;
  const contactEmail = str(contactSection, "email", "") || school.email;
  const admissionsEmail = str(contactSection, "admissionsEmail", "") || "admissions@everestbutwal.edu.np";
  const hoursNote = str(hoursSection, "note", "");
  const mapEmbed = str(mapSection, "embedUrl", "") || "https://www.google.com/maps?q=Butwal-8+Sukkhanagar&output=embed";
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

  const socialItems = ([
    { key: "facebook", label: "Facebook", icon: Facebook, href: str(social_linksSection, "facebook", "https://facebook.com/everestbutwal") },
    { key: "instagram", label: "Instagram", icon: Instagram, href: str(social_linksSection, "instagram", "https://instagram.com/everestbutwal") },
    { key: "x", label: "X", icon: Twitter, href: str(social_linksSection, "x", "") },
    { key: "youtube", label: "YouTube", icon: Youtube, href: str(social_linksSection, "youtube", "https://youtube.com/@everestbutwal") },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, href: str(social_linksSection, "linkedin", "") },
  ] as { key: string; label: string; icon: typeof Facebook; href: string }[]).filter(
    (item) => item.href !== "",
  );

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
      { source: "scms-cms", type: "select-section", pageKey: "contact", sectionType },
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
			<section className="contact-layout content">
				<aside>
					<p className="devanagari">{school.nepali}</p>
					<h2 className="t-page-title text-foreground">{school.name}</h2>
					<p>{str(contactSection, "address", "") || school.address}</p>
					<CmsSectionBox preview={preview} sectionType="office_hours" onSelect={onSelectSection} testId="cms-section-hit-office_hours">
					<div className="time-card mt-8 rounded-card border border-border bg-transparent p-6">
						<div className="flex items-center gap-2 mb-4">
							<strong data-testid="contact-open-state" className="font-display text-base tracking-wider uppercase text-foreground">
								OPEN TODAY · {weekdayHours}
							</strong>
						</div>
						<span data-testid="kathmandu-time" className="block text-base text-muted-foreground mb-6 pb-4 border-b border-rule-soft">
							{time} · ASIA/KATHMANDU
						</span>
						<ul className="space-y-3 mb-6 pb-6 border-b border-rule-soft">
							{weekHours.map(([day, hours]) => (
								<li key={day} className="flex justify-between text-base">
									<span className="font-medium text-muted-foreground">{day}</span>
									<span className="text-foreground">{hours}</span>
								</li>
							))}
						</ul>
						{hoursNote ? (
							<p data-testid="office-hours-note" className="text-sm text-muted-foreground mb-6 pb-6 border-b border-rule-soft">
								{hoursNote}
							</p>
						) : null}
						<CmsSectionBox preview={preview} sectionType="contact_details" onSelect={onSelectSection} testId="cms-section-hit-contact_details">
						<div className="flex flex-col gap-3">
							<a href={`tel:${phoneNtc}`} data-testid="contact-ntc-link" className="flex justify-between items-center text-base font-medium hover:text-accent transition-colors">
								<span className="text-muted-foreground">NTC</span>
								<span>{phoneNtc}</span>
							</a>
							<a href={`tel:${phoneNcell}`} data-testid="contact-ncell-link" className="flex justify-between items-center text-base font-medium hover:text-accent transition-colors">
								<span className="text-muted-foreground">NCELL</span>
								<span>{phoneNcell}</span>
							</a>
							<a href={`mailto:${contactEmail}`} data-testid="contact-email-link" className="flex justify-between items-center text-base font-medium hover:text-accent transition-colors">
								<span className="text-muted-foreground">EMAIL</span>
								<span>{contactEmail}</span>
							</a>
							<a href={`mailto:${admissionsEmail}`} data-testid="contact-admissions-email-link" className="flex justify-between items-center text-base font-medium hover:text-accent transition-colors">
								<span className="text-muted-foreground">ADMISSIONS</span>
								<span>{admissionsEmail}</span>
							</a>
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str(contactSection, "address", "") || "Butwal-8, Sukkhanagar, Rupandehi, Nepal")}`}
								data-testid="contact-directions-link"
								className="inline-flex mt-2 items-center justify-center font-medium text-base text-accent hover:text-accent/80 transition-colors"
							>
								GET DIRECTIONS <span className="ml-1 text-lg leading-none">↗</span>
							</a>
						</div>
						</CmsSectionBox>
					</div>
					</CmsSectionBox>
				</aside>
				<form onSubmit={(e) => e.preventDefault()} data-testid="contact-form">
					<h2 className="t-h2 text-foreground">DIRECT YOUR ENQUIRY</h2>
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
					<div className={`form-control ${errors["contact-name"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-name" style={{ color: "var(--c-ink)" }}>Full name</Label>
						<Input
							type="text"
							id="contact-name"
							name="name"
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
					<div className={`form-control ${errors["contact-email"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-email" style={{ color: "var(--c-ink)" }}>Email address</Label>
						<Input
							type="email"
							id="contact-email"
							name="email"
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
					<div className={`form-control ${errors["contact-phone"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-phone" style={{ color: "var(--c-ink)" }}>Phone number</Label>
						<Input
							type="tel"
							id="contact-phone"
							name="phone"
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
					<div className={`form-control ${errors["contact-message"] ? "form-control--error" : ""}`}>
						<div className="label-line flex justify-between w-full">
							<Label htmlFor="contact-message" style={{ color: "var(--c-ink)" }}>Message</Label>
							<span
								id="contact-message-count"
								data-testid="contact-message-count"
								style={{ color: "var(--c-n-500)", fontSize: "14px" }}
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
							className="editorial-input"
						/>
						{errors["contact-message"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-message"]}
							</p>
						)}
					</div>
					<Button type="submit" testId="contact-submit-button" className="institution-button institution-button--full w-full py-3 mt-6">
						Send enquiry
					</Button>
					<p className="form-note">
						This preview validates the form but does not transmit messages.
					</p>
				</form>
			</section>
			<CmsSectionBox preview={preview} sectionType="map" onSelect={onSelectSection} testId="cms-section-hit-map">
			<section
				className="map-panel content"
				aria-label={mapLabel}
				data-testid="school-map"
			>
				<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
					<h2 className="t-h2 text-foreground">{mapLabel}</h2>
					{mapDirections ? (
						<p className="text-sm text-muted-foreground">{mapDirections}</p>
					) : null}
				</div>
				<iframe
					src={mapEmbed}
					width="100%"
					height="400"
					style={{ border: 0 }}
					allowFullScreen={true}
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				></iframe>
				{mapLat && mapLng ? (
					<p className="mt-3 text-sm text-muted-foreground">
						<a
							href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent/80 transition-colors"
						>
							Open in Google Maps <span className="text-base leading-none">↗</span>
						</a>
						<span className="ml-3 font-mono text-xs text-muted-foreground/70">
							{mapLat}, {mapLng}
						</span>
					</p>
				) : null}
			</section>
			</CmsSectionBox>
			<CmsSectionBox preview={preview} sectionType="department_list" onSelect={onSelectSection} testId="cms-section-hit-department_list">
			<section className="departments content">
				{str(deptSection, "eyebrow") ? (
					<p className="t-eyebrow mb-2">{str(deptSection, "eyebrow")}</p>
				) : null}
				<h2 className="t-h2 text-foreground">{str(deptSection, "title", "") || "WHO TO ASK"}</h2>
				<div>
					{departments.map((d) => (
						<article key={d.id} data-testid={`department-${d.id}`}>
							<span>{d.name}</span>
							<h3 className="font-display text-xl text-foreground font-semibold">{d.contact}</h3>
							{d.email ? (
								<a href={`mailto:${d.email}`}>{d.email}</a>
							) : null}
							{d.hours ? <p>{d.hours}</p> : null}
						</article>
					))}
				</div>
			</section>
			</CmsSectionBox>
			<CmsSectionBox preview={preview} sectionType="social_links" onSelect={onSelectSection} testId="cms-section-hit-contact-social_links">
				<section className="contact-social strip mt-12 rounded-2xl border border-border bg-card p-6">
					<h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">FOLLOW</h3>
					<h2 className="t-h2 text-foreground mb-4">Follow the school</h2>
					{socialItems.length > 0 ? (
						<div className="flex flex-wrap gap-4">
							{socialItems.map((item) => (
								<a
									key={item.key}
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70"
								>
									<item.icon className="h-4 w-4" />
									<span className="font-medium">{item.label}</span>
								</a>
							))}
						</div>
					) : preview ? (
						<p className="text-sm text-muted-foreground">Social links section — click to edit.</p>
					) : null}
				</section>
			</CmsSectionBox>
		</>
	);
}
