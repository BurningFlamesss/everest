import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Bus, Car, Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { Badge } from "#/components/ui/badge";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { formatNpr } from "#/lib/fees";
import {
	getBusRoutesServer,
	getWebsitePagePreviewServer,
} from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from "#/templates/modern/components/interactions/BusFinder";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/transportation")({
	head: () =>
		pageMeta({
			title:
				"School Bus Routes & Transportation Network | Everest English Boarding Secondary School (EEBSS)",
			description:
				"Safe, scheduled school bus routes covering Butwal, Tilottama, Manigram, Devdaha, and Sainamaina. View pickup timings, per-stop fare details, and route stops for Everest School students.",
			path: "/transportation",
			keywords:
				"everest school bus, school transportation butwal, school bus routes tilottama, eebss bus service, rupandehi student transport",
		}),
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "transportation" },
			});
		}
		const routes = await getBusRoutesServer();
		return {
			previewPage,
			routes,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage, routes = [] } = Route.useLoaderData();
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
		str(contactSection, "admissionsEmail") || "admissions@everestbutwal.edu.np";
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
						"Comprehensive school fleet covering Rupandehi from Devdaha in the north-east to Sunauli in the south with real-time stops, schedules, and fares."
					}
				/>
			</CmsSectionBox>

			{/* Interactive Finder powered by dynamic routes */}
			<div className="mt-10 mb-16">
				<BusFinder dynamicRoutes={routes} />
			</div>

			{/* Dynamic Route & Fleet Directory Section */}
			{routes.length > 0 && (
				<section className="mb-16 space-y-8" data-testid="dynamic-fleet-directory">
					<div className="flex flex-col gap-2 border-b border-border pb-4">
						<span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
							FLEET DIRECTORY & SCHEDULES
						</span>
						<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
							Active School Routes & Stop Timings
						</h2>
						<p className="text-sm text-muted-foreground max-w-2xl">
							All vehicles are operated by certified drivers with dedicated campus assistance.
							Fares are calculated based on your designated pickup stop.
						</p>
					</div>

					<div className="grid gap-6">
						{routes.map((route: any) => {
							const rawStops: any[] = Array.isArray(route.stops) ? route.stops : [];
							const stops = rawStops.map((s, idx) => {
								if (typeof s === "string") {
									return {
										name: s,
										landmark: "",
										pickupTime: "07:00",
										dropoffTime: "16:00",
										fare: route.feeMonthly,
									};
								}
								return {
									name: s.name || `Stop ${idx + 1}`,
									landmark: s.landmark || "",
									pickupTime: s.pickupTime || s.pickup || "07:00",
									dropoffTime: s.dropoffTime || s.drop || "16:00",
									fare: s.fare ?? route.feeMonthly,
								};
							});

							const vType = route.vehicleType || "Bus";
							const isVan = vType.toLowerCase() === "van";

							return (
								<div
									key={route.id}
									className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6"
								>
									{/* Route Header */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
										<div className="flex flex-col gap-1.5">
											<div className="flex items-center gap-2.5 flex-wrap">
												<span className="text-lg font-bold text-foreground">
													Route {route.busNumber}
												</span>
												<Badge
													variant={isVan ? "secondary" : "default"}
													className="text-[11px] uppercase tracking-wider px-2 py-0.5"
												>
													{isVan ? (
														<Car className="mr-1 h-3 w-3" />
													) : (
														<Bus className="mr-1 h-3 w-3" />
													)}
													{vType}
												</Badge>
												{route.capacity ? (
													<span className="text-xs text-muted-foreground flex items-center gap-1">
														<Users className="h-3 w-3" />
														{route.capacity} seats capacity
													</span>
												) : null}
											</div>
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span>
													Driver:{" "}
													<strong className="text-foreground font-medium">
														{route.driverName || "Assigned Driver"}
													</strong>
												</span>
												{route.driverPhone ? (
													<a
														href={`tel:${route.driverPhone}`}
														className="text-primary hover:underline flex items-center gap-1 font-mono"
													>
														<Phone className="h-3 w-3" />
														{route.driverPhone}
													</a>
												) : null}
											</div>
										</div>

										<div className="flex flex-col sm:items-end">
											<span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
												Monthly Transport
											</span>
											<span className="text-xl font-bold font-mono text-foreground">
												{route.feeMonthly
													? formatNpr(route.feeMonthly)
													: "Standard Rates"}
											</span>
										</div>
									</div>

									{/* Stop-by-stop Timeline Table */}
									<div className="space-y-3">
										<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Stop Schedule ({stops.length} points)
										</span>
										<div className="overflow-x-auto">
											<table className="w-full text-left text-xs">
												<thead>
													<tr className="border-b border-border text-muted-foreground">
														<th className="py-2 pr-3 font-medium w-10">#</th>
														<th className="py-2 pr-4 font-medium">Stop Location</th>
														<th className="py-2 pr-4 font-medium">Landmark</th>
														<th className="py-2 pr-4 font-medium">Morning Pickup</th>
														<th className="py-2 pr-4 font-medium">Afternoon Drop</th>
														<th className="py-2 text-right font-medium">Monthly Fare</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-border/60">
													{stops.map((stop, idx) => (
														<tr
															key={idx}
															className="hover:bg-muted/30 transition-colors"
														>
															<td className="py-2.5 pr-3 font-mono text-muted-foreground font-bold">
																{String(idx + 1).padStart(2, "0")}
															</td>
															<td className="py-2.5 pr-4 font-medium text-foreground">
																{stop.name}
															</td>
															<td className="py-2.5 pr-4 text-muted-foreground">
																{stop.landmark || "—"}
															</td>
															<td className="py-2.5 pr-4 font-mono text-foreground flex items-center gap-1">
																<Clock className="h-3 w-3 text-muted-foreground shrink-0" />
																{stop.pickupTime}
															</td>
															<td className="py-2.5 pr-4 font-mono text-foreground">
																{stop.dropoffTime}
															</td>
															<td className="py-2.5 text-right font-mono font-medium text-foreground">
																{stop.fare ? formatNpr(stop.fare) : "—"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

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
						Questions about routes or requesting a new stop?
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
