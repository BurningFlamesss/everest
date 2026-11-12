
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from "#/templates/modern/components/interactions/BusFinder";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/transportation")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "transportation" },
			});
		}
		return {
			previewPage,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("transportation");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as any;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const contactSection = {
		...sectionDefaults("contact_details"),
		...getSectionFields(cmsData?.blocks, "contact_details"),
	};
	const phone = str(contactSection, "phone") || "+977 71 535962";
	const secondaryPhone =
		str(contactSection, "secondaryPhone") || "+977 71 531342";
	const email = str(contactSection, "email") || "everestbutwal@gmail.com";
	const admissionsEmail =
		str(contactSection, "admissionsEmail") ||
		"admissions@everestbutwal.edu.np";
	const address =
		str(contactSection, "address") ||
		"Butwal-8, Sukkhanagar, Rupandehi, Lumbini Province, Nepal";

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "transportation",
				sectionType,
			},
			"*",
		);
	};

	return (
		<PageFrame>
			<CmsSectionBox
				preview={preview}
				sectionType="headline"
				onSelect={onSelectSection}
				testId="cms-section-hit-transportation-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "TRANSPORTATION"}
					title={str(headerSection, "title") || "Bus route and pickup finder"}
					lead={
						str(headerSection, "body") ||
						"Three routes cover Rupandehi from Devdaha in the north-east to Sunauli in the south."
					}
				/>
			</CmsSectionBox>
			<div className="mt-10 mb-16">
				<BusFinder />
			</div>
			<CmsSectionBox
				preview={preview}
				sectionType="contact_details"
				onSelect={onSelectSection}
				testId="cms-section-hit-transportation-contact_details"
				className="mb-16"
			>
				<div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
					<p className="t-eyebrow">TRANSPORT OFFICE</p>
					<h2 className="mt-2 text-xl font-semibold text-foreground">
						Questions about routes?
					</h2>
					<ul className="mt-5 grid gap-4 sm:grid-cols-3">
						{phone || secondaryPhone ? (
							<li className="flex items-start gap-3">
								<Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<div className="text-sm leading-relaxed text-muted-foreground">
									{phone ? <p>{phone}</p> : null}
									{secondaryPhone ? <p>{secondaryPhone}</p> : null}
								</div>
							</li>
						) : null}
						{email || admissionsEmail ? (
							<li className="flex items-start gap-3">
								<Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<div className="text-sm leading-relaxed text-muted-foreground">
									{email ? (
										<a
											href={`mailto:${email}`}
											className="hover:text-foreground"
										>
											{email}
										</a>
									) : null}
									{admissionsEmail ? (
										<p>
											<a
												href={`mailto:${admissionsEmail}`}
												className="hover:text-foreground"
											>
												{admissionsEmail}
											</a>
										</p>
									) : null}
								</div>
							</li>
						) : null}
						{address ? (
							<li className="flex items-start gap-3">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<p className="text-sm leading-relaxed text-muted-foreground">
									{address}
								</p>
							</li>
						) : null}
					</ul>
				</div>
			</CmsSectionBox>
		</PageFrame>
	);
}

