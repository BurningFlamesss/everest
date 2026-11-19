import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	ArrowRight,
	ArrowUpRight,
	BookOpen,
	Building2,
	ExternalLink,
	Info,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { num, rows, str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { NoticeDialog } from "#/components/common/NoticeDialog";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel.jsx";
import { albums } from "#/content/gallery";
import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { useHeroAutoplay } from "#/hooks/useHeroAutoplay.ts";
import type { CmsPageKey } from "#/lib/cms-sections";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { FACEBOOK_PAGE_URL } from "#/lib/facebook-feed.ts";
import { leadership } from "#/lib/faculty";
import type { OverlaySegment } from "#/lib/hero-autoplay.ts";
import {
	overlayBodyStyle,
	overlaySegments,
	overlayWordStyle,
	START_DELAY_MS,
} from "#/lib/hero-autoplay.ts";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import { getFacebookPostsServer } from "#/packages/content/server/facebook.ts";
import { SectionHeading } from "#/templates/modern/components/chrome/PageFrame";
import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";
import { ResultsChart } from "#/templates/modern/components/utilities/ResultsChart";
import type { BlockType } from "#/types";

gsap.registerPlugin(ScrollTrigger);

interface LandingCmsContent {
	/** Published (or preview) CMS page for the home key; null → static defaults. */
	page: WebsitePageContent | null;
	/** True when rendered inside the admin live-preview iframe (?cms=1). */
	preview: boolean;
}

/** Merge a section's defaults with any saved CMS overrides. */
function useSection(
	page: WebsitePageContent | null,
	type: BlockType,
	pageKey?: CmsPageKey,
) {
	return {
		...sectionDefaults(type, pageKey),
		...getSectionFields(page?.blocks as never, type),
	} as Record<string, unknown>;
}

const DISCOVER_ICONS: Record<string, typeof BookOpen> = {
	"/courses": BookOpen,
	"/facilities": Building2,
	"/about": Info,
};

export default function LandingPage({
	page = null,
	preview = false,
}: Partial<LandingCmsContent> = {}) {
	const containerRef = useRef<HTMLDivElement>(null);

	const hero = useSection(page, "landing_hero");
	const closing = useSection(page, "hero", "home");
	const facts = useSection(page, "landing_facts");
	const discover = useSection(page, "discover_cards");
	const headings = useSection(page, "landing_section_headings");

	const onSelectSection = (sectionType: BlockType) => {
		if (typeof window !== "undefined" && window.parent) {
			window.parent.postMessage(
				{
					source: "scms-cms",
					type: "select-section",
					pageKey: "home",
					sectionType,
				},
				"*",
			);
		}
	};

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".hero-next-section",
				{
					yPercent: 100,
					clipPath: "polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)",
				},
				{
					yPercent: 0,
					clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					ease: "none",
					scrollTrigger: {
						trigger: containerRef.current,
						start: "20% top",
						end: "bottom bottom",
						scrub: true,
					},
				},
			);
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<>
			<div className="relative min-h-screen bg-background">
				<div
					id="hero-track"
					data-hero-track="true"
					ref={containerRef}
					className="relative h-[600vh]"
				>
					<div className="sticky top-0 h-screen w-full overflow-hidden bg-[#16181d]">
						<CmsSectionBox
							preview={preview}
							sectionType="landing_hero"
							onSelect={onSelectSection}
							testId="cms-section-hit-landing_hero"
							className="h-full"
						>
							<HeroStage
								scrollTrackRef={containerRef}
								footage={hero}
								preview={preview}
							/>
						</CmsSectionBox>
					</div>

					<section className="hero-next-section absolute inset-x-0 bottom-0 z-10 mx-auto w-8/9 overflow-y-auto overflow-x-hidden bg-[#FEF2F2] rounded-t-3xl min-h-[70vh] lg:h-[80vh]">
						<CmsSectionBox
							preview={preview}
							sectionType="hero"
							onSelect={onSelectSection}
							className="h-full"
						>
							<ClosingHero closing={closing} />
						</CmsSectionBox>
					</section>
				</div>

				<div className="relative z-20 bg-[#FEF2F2] px-8 py-24 pb-32">
					<div className="mx-auto max-w-screen-xl">
						{/* Result Chart */}
						<div className="mb-32">
							<SectionHeading
								eyebrow={str(headings, "resultsEyebrow", "Academic Excellence")}
								title={str(headings, "resultsTitle", "Board Results")}
								description={str(
									headings,
									"resultsDesc",
									"Consistent performance across all levels of examination.",
								)}
							/>
							<div className="mt-12 rounded-card border border-border bg-card p-6 shadow-sm sm:p-10">
								<ResultsChart />
							</div>
						</div>

						{/* Discover / About / Courses / Facilities */}
						<div className="mb-32">
							<CmsSectionBox
								preview={preview}
								sectionType="landing_section_headings"
								onSelect={onSelectSection}
								testId="cms-section-hit-landing_section_headings"
							>
								<SectionHeading
									eyebrow={str(headings, "discoverEyebrow", "Explore Everest")}
									title={str(headings, "discoverTitle", "Discover the school")}
									description={str(
										headings,
										"discoverDesc",
										"Learn more about our academic programs, state-of-the-art facilities, and the institution's history.",
									)}
								/>
							</CmsSectionBox>
							<CmsSectionBox
								preview={preview}
								sectionType="discover_cards"
								onSelect={onSelectSection}
								testId="cms-section-hit-discover_cards"
							>
								<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{rows(discover, "cards").map((card, i) => {
										const href = str(card, "href", "/");
										const Icon = DISCOVER_ICONS[href] ?? Info;
										const image = str(card, "image", "");
										return (
											<Link
												key={href || String(i)}
												to={href as never}
												className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
											>
												{image ? (
													<div className="mb-2 h-[160px] w-full overflow-hidden rounded-md border border-border bg-secondary">
														<img
															src={image}
															alt=""
															className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
														/>
													</div>
												) : (
													<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
														<Icon
															className="h-6 w-6 text-accent"
															aria-hidden="true"
														/>
													</div>
												)}
												<p className="t-eyebrow mt-6">{str(card, "eyebrow")}</p>
												<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
													{str(card, "title")}
												</h3>
												<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
													{str(card, "body")}
												</p>
												<span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
													{str(card, "ctaLabel", "Learn more")}
													<ArrowRight
														className="h-3.5 w-3.5"
														aria-hidden="true"
													/>
												</span>
											</Link>
										);
									})}
								</div>
							</CmsSectionBox>
						</div>

						{/* Institution facts */}
						<div className="mb-32">
							<CmsSectionBox
								preview={preview}
								sectionType="landing_facts"
								onSelect={onSelectSection}
								testId="cms-section-hit-landing_facts"
							>
								<div className="border-t border-rule-strong pt-6">
									<div className="grid gap-10 lg:grid-cols-[6fr_5fr] lg:gap-[8%]">
										<div>
											<p className="t-eyebrow">At a glance</p>
											<h2
												className="mt-3 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground whitespace-pre-line"
												data-testid="landing-facts-title"
											>
												{str(
													facts,
													"title",
													"Established in purpose.\nContemporary in outlook.",
												)}
											</h2>
										</div>
										<div className="lg:pt-1">
											<p className="max-w-[52ch] text-[15px] leading-[1.75] text-muted-foreground">
												{str(facts, "body", "")}
											</p>
											<dl className="mt-8 border-t border-rule-soft">
												{rows(facts, "facts").map((fact, i) => (
													<div
														key={String(fact.label ?? i)}
														className="grid gap-1.5 border-b border-rule-soft py-4 sm:grid-cols-[150px_1fr] sm:gap-5"
													>
														<dt className="t-eyebrow text-n-600">
															{String(fact.label ?? "")}
														</dt>
														<dd className="text-[14px] font-medium leading-relaxed text-foreground">
															{String(fact.value ?? "")}
														</dd>
													</div>
												))}
											</dl>
										</div>
									</div>
								</div>
							</CmsSectionBox>
						</div>

						{/* Gallery */}
						<div className="mb-32">
							<SectionHeading
								eyebrow={str(headings, "galleryEyebrow", "Campus Life")}
								title={str(headings, "galleryTitle", "Gallery Highlights")}
								description={str(
									headings,
									"galleryDesc",
									"Moments captured around the school grounds and during major events.",
								)}
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{albums.slice(0, 3).map((album) => (
									<Link
										key={album.id}
										to="/gallery"
										className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
									>
										<div className="mb-6 h-[200px] w-full overflow-hidden rounded-md border border-border bg-secondary">
											<img
												src={album.photos[0].src}
												alt={album.photos[0].alt}
												className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
											/>
										</div>
										<p className="t-eyebrow mt-auto">
											{album.year} · {album.category}
										</p>
										<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground line-clamp-2">
											{album.event}
										</h3>
										<span className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
											View all {album.photos.length} photos
											<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
									</Link>
								))}
							</div>
						</div>

						{/* Latest Updates */}
						<div className="mb-32">
							<SectionHeading
								eyebrow={str(headings, "updatesEyebrow", "Stay Updated")}
								title={str(headings, "updatesTitle", "Latest Announcements")}
								description={str(
									headings,
									"updatesDesc",
									"News and events from our community timeline.",
								)}
								aside={
									<Link
										to="/posts"
										data-testid="landing-view-all-posts"
										className="inline-flex min-h-11 items-center gap-1.5 rounded-chip border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground transition-colors duration-fast hover:border-rule-strong hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
									>
										View all posts
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</Link>
								}
							/>
							<div className="mt-12">
								<FacebookCarousel />
							</div>
						</div>

						{/* Faculty */}
						<div>
							<SectionHeading
								eyebrow={str(headings, "facultyEyebrow", "Leadership")}
								title={str(headings, "facultyTitle", "Our Faculty")}
								description={str(
									headings,
									"facultyDesc",
									"The educators leading our academic departments and steering the school's vision.",
								)}
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{leadership.slice(0, 3).map((person) => (
									<Link
										key={person.id}
										to="/faculty"
										className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
									>
										<MonogramAvatar
											name={person.name}
											department={person.department}
											src={person.photo}
											size="lg"
										/>
										<p className="t-eyebrow mt-6">{person.role}</p>
										<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
											{person.name}
										</h3>
										{person.qualification ? (
											<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
												{person.qualification}
											</p>
										) : null}
										<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4">
											<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground">
												{person.department}
											</span>
											{person.extension ? (
												<span className="t-meta">Ext. {person.extension}</span>
											) : null}
										</div>
										<span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
											View directory
											<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			<NoticeDialog />
		</>
	);
} /**
 * The closing panel's single campus plate: a frame already served for the
 * scroll hero, so the shaped image adds no new assets.
 */
const CLOSING_IMAGE = "/schools/everest/landing-footage/frame_0139.jpeg";

/**
 * The landing page's closing hero.
 *
 * It is the panel that rides up over the footage at the end of the scroll
 * track, so it is the first thing a visitor can actually read and act on: the
 * institution's statement, one sentence of evidence, and the calls to action
 * the page previously lacked. The campus appears once, as a single plate
 * clipped into an arch — the shape of the school's own gateways — held by a
 * hairline frame and a cream mat. Copy comes from the `hero` section of the
 * home page, so every line here is editable in the CMS.
 */
function ClosingHero({ closing }: { closing: Record<string, unknown> }) {
	const headline = str(closing, "headline", "Educated for\nthe climb ahead.");
	const lines = headline.split("\n").filter((line) => line.trim() !== "");
	const primaryHref = str(closing, "primaryCtaHref", "/admissions");
	const secondaryHref = str(closing, "secondaryCtaHref", "/contact");

	const quickLinks = [
		{ index: "01", label: "Academics", href: "/courses" },
		{ index: "02", label: "Campus", href: "/facilities" },
		{ index: "03", label: "The institution", href: "/about" },
	];

	return (
		<div className="flex h-full min-h-[70vh] w-full flex-col bg-[#FEF2F2] text-black lg:min-h-0">
			<div className="mx-auto flex w-full max-w-[1200px] flex-col px-6 pb-6 sm:px-10 lg:min-h-0 lg:flex-1 lg:px-12 lg:pb-20">
				{/* Masthead — who the school is on the left, the live admissions state on the right. */}
				<div className="flex shrink-0 items-center justify-between gap-6 border-b border-black/10 py-4">
					<p className="flex min-w-0 items-center gap-3 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-black/60">
						<span
							aria-hidden="true"
							className="h-1.5 w-1.5 shrink-0 bg-[var(--c-red)]"
						/>
						<span className="truncate">
							{str(closing, "eyebrow", "Everest English Boarding · Butwal-8")}
						</span>
					</p>
					<p className="hidden shrink-0 items-center gap-2 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-black/60 sm:flex">
						<span
							aria-hidden="true"
							className="h-1.5 w-1.5 rounded-full bg-[var(--c-red)]"
						/>
						Admissions open · 2083 B.S.
					</p>
				</div>

				{/* The statement and the single campus plate. */}
				<div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,30%)] lg:grid-rows-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_minmax(300px,33%)]">
					<div className="flex min-h-0 flex-col justify-center pb-8 pt-8 sm:pt-10 lg:col-start-1 lg:row-start-1 lg:justify-start lg:pr-12 lg:pt-6">
						<h2 className="font-display text-[clamp(2.4rem,4.2vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.03em]">
							{lines.map((line, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: headline lines are static copy reordered only by CMS edits
									key={`${line}-${index}`}
									className={`block ${index === 0 ? "text-black" : "text-[var(--c-red)]"}`}
								>
									{line}
								</span>
							))}
						</h2>

						<p className="mt-6 max-w-[56ch] text-[15px] leading-[1.7] text-black/70 sm:text-[16px]">
							{str(
								closing,
								"subheadline",
								"Three decades of Science and Management teaching in Rupandehi — small classes, working laboratories, and a faculty that knows every name in the room.",
							)}
						</p>

						<div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
							<Link
								to={primaryHref as never}
								data-testid="landing-hero-primary-cta"
								className="institution-button group inline-flex items-center justify-center gap-2.5"
							>
								{str(closing, "primaryCtaLabel", "Start an application")}
								<ArrowUpRight
									className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</Link>
							<Link
								to={secondaryHref as never}
								data-testid="landing-hero-secondary-cta"
								className="group inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-black transition-colors duration-200 hover:text-[var(--c-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEF2F2]"
							>
								<span className="border-b border-black/30 pb-1 transition-colors duration-200 group-hover:border-[var(--c-red)]">
									{str(closing, "secondaryCtaLabel", "Visit the campus")}
								</span>
								<ArrowRight
									className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</Link>
						</div>
					</div>

					{/* One campus plate, clipped into an arch and held by a hairline frame. */}
					<figure className="m-0 mb-6 min-h-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:pt-6 lg:pr-10">
						<div className="relative h-[220px] sm:h-[280px] lg:h-full">
							<div
								aria-hidden="true"
								className="pointer-events-none absolute inset-0 rounded-t-full border border-black/15"
							/>
							<div className="absolute inset-x-[10px] bottom-0 top-[10px] overflow-hidden rounded-t-full bg-[#16181d]">
								<img
									src={CLOSING_IMAGE}
									alt="The brick façade of Everest English Boarding, its flags flying above the roofline in Butwal."
									className="h-full w-full object-cover object-[50%_60%] transition-transform duration-700 ease-out hover:scale-[1.03]"
								/>
							</div>
						</div>
					</figure>

					{/* Index strip: the three destinations the school is mostly asked about. */}
					<nav
						aria-label="Explore Everest"
						className="border-t border-black/10 lg:col-start-1 lg:row-start-2"
					>
						<ul className="grid grid-cols-3">
							{quickLinks.map((link, index) => (
								<li
									key={link.href}
									className={index > 0 ? "border-l border-black/10" : ""}
								>
									<Link
										to={link.href as never}
										className="group flex min-h-[52px] items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-black hover:text-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--c-red)] sm:px-6"
									>
										<span className="font-mono text-[9px] tracking-[0.16em] text-black/60 transition-colors duration-200 group-hover:text-white">
											{link.index}
										</span>
										<span className="truncate text-[13px] font-medium">
											{link.label}
										</span>
										<ArrowUpRight
											className="ml-auto h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
											aria-hidden="true"
										/>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
}

/** Style the shared playhead hands to one word of an overlay. */
interface WordStyle {
	opacity: number;
	y: number;
	blur: number;
}

function wordStyleToCss(style: WordStyle): React.CSSProperties {
	return {
		opacity: style.opacity,
		transform: `translate3d(0, ${style.y.toFixed(2)}px, 0)`,
		filter: style.blur > 0.05 ? `blur(${style.blur.toFixed(2)}px)` : "none",
	};
}

/**
 * One overlay headline. Words cascade in one after another as the playhead
 * crosses the segment's enter span, so the copy animates on exactly the frames
 * its footage owns instead of appearing as a block.
 */
function OverlayTitle({
	text,
	frame,
	segment,
}: {
	text: string;
	frame: number;
	segment: OverlaySegment | undefined;
}) {
	const words = text.split(/\s+/).filter(Boolean);
	if (!segment) return <>{text}</>;
	return (
		<>
			{words.map((word, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static copy, words only reorder on CMS edit
					key={`${word}-${index}`}
					className="inline-block will-change-[opacity,transform,filter]"
					style={wordStyleToCss(
						overlayWordStyle(frame, segment, index, words.length),
					)}
				>
					{word}
					{index < words.length - 1 ? " " : null}
				</span>
			))}
		</>
	);
}

/**
 * The whole landing hero: footage canvas + the three text overlays, sharing a
 * single playhead.
 *
 * The playhead IS the page's scroll position — a ScrollTrigger maps it onto
 * both the frame index and the text overlays, so a given frame always carries
 * its own copy and they can never desync. Time advances that same playhead:
 * `useHeroAutoplay` drives `window.scrollTo` while the visitor is idle, and
 * any wheel/touch/key input becomes a seek that pauses playback briefly.
 */
function HeroStage({
	scrollTrackRef,
	footage,
	preview,
}: {
	scrollTrackRef: React.RefObject<HTMLDivElement | null>;
	footage: Record<string, unknown>;
	preview: boolean;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { drawFrame, frameCount, isLoading, progress, ready } = useCanvasVideo(
		canvasRef,
		{
			folder: str(footage, "footageBase", "/schools/everest/landing-footage/"),
			prefix: str(footage, "footagePrefix", "frame_"),
			extension: str(footage, "footageExtension", ".jpeg"),
			frameCount: num(footage, "footageFrameCount", 274),
		},
	);

	const autoplaySeconds = num(footage, "autoplaySeconds", 14);

	// Fractional frame index — the single value both the canvas and the text
	// read. Fractional (not floored) so the word animations move smoothly
	// between frames instead of stepping.
	const [playhead, setPlayhead] = useState(0);

	const segments = useMemo(() => overlaySegments(frameCount), [frameCount]);

	// --- the playhead: one scrubbed ScrollTrigger drives frames + text -----
	useEffect(() => {
		if (!ready) return;

		const handleResize = () => {
			const trigger = ScrollTrigger.getById("hero-scroll");
			drawFrame(trigger ? trigger.progress * (frameCount - 1) : 0);
		};
		addEventListener("resize", handleResize);

		const trigger = ScrollTrigger.create({
			id: "hero-scroll",
			trigger: scrollTrackRef.current,
			start: "top top",
			end: "bottom bottom",
			onUpdate: (self) => {
				const frameIndex = self.progress * (frameCount - 1);
				drawFrame(frameIndex);
				setPlayhead(frameIndex);
			},
		});

		// Draw the frame that matches where the page already is (a reload
		// halfway down, a deep link, a restored scroll position).
		const initialFrame = trigger.progress * (frameCount - 1);
		drawFrame(initialFrame);
		setPlayhead(initialFrame);

		return () => {
			removeEventListener("resize", handleResize);
			trigger.kill();
		};
	}, [ready, drawFrame, scrollTrackRef, frameCount]);

	// Redraw once the initial batch finishes so no frame is left half-loaded.
	useEffect(() => {
		if (!ready || isLoading) return;
		const id = requestAnimationFrame(() => {
			const trigger = ScrollTrigger.getById("hero-scroll");
			drawFrame(trigger ? trigger.progress * (frameCount - 1) : 0);
		});
		return () => cancelAnimationFrame(id);
	}, [ready, isLoading, drawFrame, frameCount]);

	// --- auto-play ---------------------------------------------------------
	const [reducedMotion, setReducedMotion] = useState(false);
	useEffect(() => {
		const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
		if (!query) return;
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	const getRange = useCallback(() => {
		const trigger = ScrollTrigger.getById("hero-scroll");
		if (!trigger) return { start: 0, end: 0 };
		return { start: trigger.start, end: trigger.end };
	}, []);

	const motionAllowed = !preview && autoplaySeconds > 0 && !reducedMotion;

	const { start: startAutoplay } = useHeroAutoplay({
		durationSeconds: autoplaySeconds,
		getRange,
		enabled: ready && motionAllowed,
	});

	useEffect(() => {
		if (!(ready && motionAllowed) || !canvasRef.current) return;
		const { start, end } = getRange();
		// Play from the opening frame only. A visitor who reloaded mid-page or
		// followed an anchor must not be dragged back to the hero.
		if (end <= start || window.scrollY > start + 4) return;
		const timer = window.setTimeout(startAutoplay, START_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [ready, motionAllowed, startAutoplay, getRange]);

	// --- render ------------------------------------------------------------
	const overlayClasses = [
		"absolute right-8 top-1/4 max-w-lg text-right text-white filter-[drop-shadow(0_0_6px_rgba(0,0,0,0.45))_drop-shadow(0_2px_4px_rgba(0,0,0,0.35))_drop-shadow(0_0_14px_rgba(0,0,0,0.2))] lg:right-24",
		"absolute bottom-24 left-8 max-w-xl text-white filter-[drop-shadow(0_0_6px_rgba(0,0,0,0.45))_drop-shadow(0_2px_4px_rgba(0,0,0,0.35))_drop-shadow(0_0_14px_rgba(0,0,0,0.2))] lg:left-24",
		"absolute inset-0 flex flex-col items-center justify-center text-center text-white filter-[drop-shadow(0_0_6px_rgba(0,0,0,0.45))_drop-shadow(0_2px_4px_rgba(0,0,0,0.35))_drop-shadow(0_0_14px_rgba(0,0,0,0.2))]",
	];

	// Typography kept from the original markup: overlays 1–2 share a size and
	// the closing statement is larger, matching the hero as it shipped.
	const titleClasses = [
		"font-display text-3xl font-bold leading-tight sm:text-4xl md:text-6xl lg:text-[clamp(2.75rem,4.2vw,4.5rem)]",
		"font-display text-3xl font-bold leading-tight sm:text-4xl md:text-6xl lg:text-[clamp(2.75rem,4.2vw,4.5rem)]",
		"font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-[clamp(3.5rem,6vw,6.5rem)]",
	];
	const bodyClasses = [
		"mt-5 text-base font-medium text-white/95 sm:text-lg md:text-xl lg:text-[clamp(1.05rem,1.45vw,1.35rem)]",
		"mt-5 text-base font-medium text-white/95 sm:text-lg md:text-xl lg:text-[clamp(1.05rem,1.45vw,1.35rem)]",
		"mt-5 text-lg font-medium text-white/95 md:text-xl lg:text-[clamp(1.2rem,2vw,1.6rem)]",
	];

	const copy = [
		{
			title: str(footage, "text1Title", "A place to grow."),
			body: str(
				footage,
				"text1Body",
				"Developing character, capability, and curiosity since 2050 BS.",
			),
		},
		{
			title: str(footage, "text2Title", "Future ready."),
			body: str(
				footage,
				"text2Body",
				"Our state-of-the-art facilities and modern curriculums empower students to thrive in an evolving world.",
			),
		},
		{
			title: str(footage, "text3Title", "Everest."),
			body: str(footage, "text3Body", "The summit of education."),
		},
	];

	return (
		<div className="absolute inset-0 bg-[#16181d]">
			{isLoading && (
				<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background">
					<div className="text-center">
						<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-lg font-medium font-display">
							Loading Experience
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{Math.round(progress)}%
						</p>
					</div>
				</div>
			)}

			<canvas
				ref={canvasRef}
				className="block h-full w-full object-cover filter contrast-[1.05] saturate-[1.05]"
			/>

			{/* Soft vignette keeps white copy legible over bright frames without dimming the footage itself. */}
			<div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/15 via-transparent to-black/25" />

			<div className="pointer-events-none absolute inset-0 z-10 flex lg:pl-[var(--nav-w)]">
				<div className="relative h-full w-full p-8 lg:p-16">
					{segments.map((segment, index) => {
						const item = copy[index];
						if (!item) return null;
						const bodyStyle = overlayBodyStyle(playhead, segment);
						const TitleTag = index === 0 ? "h1" : "h2";
						return (
							<div
								key={segment.text}
								className={overlayClasses[index]}
								data-overlay={segment.text}
							>
								<div className={index === 2 ? "max-w-3xl px-6" : "max-w-full"}>
									<TitleTag className={titleClasses[index]}>
										<OverlayTitle
											text={item.title}
											frame={playhead}
											segment={segment}
										/>
									</TitleTag>
									<p
										className={`${bodyClasses[index]} will-change-[opacity,transform,filter]`}
										style={wordStyleToCss(bodyStyle)}
									>
										{item.body}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function FacebookCarousel() {
	const { data, status } = useQuery({
		queryKey: ["facebook-posts", "landing"],
		queryFn: () => getFacebookPostsServer({ data: { page: 1, pageSize: 6 } }),
	});

	const posts = data?.data ?? [];

	if (status === "pending") {
		return (
			<div className="h-64 flex items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-border border-t-ring animate-spin" />
			</div>
		);
	}

	if (status === "error") {
		// The fetch itself failed (network, restart mid-deploy) — say so,
		// rather than passing it off as an unconfigured feed.
		return (
			<div
				className="max-w-md rounded-card border border-border bg-card/60 p-8 text-[14px] leading-relaxed text-muted-foreground"
				data-testid="facebook-carousel-error"
			>
				Couldn&apos;t load the Facebook feed right now. Please try again in a
				few minutes, or{" "}
				<a
					href={FACEBOOK_PAGE_URL}
					target="_blank"
					rel="noreferrer"
					className="font-medium text-foreground underline-offset-4 hover:underline"
				>
					visit our page
				</a>
				.
			</div>
		);
	}

	if (posts.length === 0) {
		// No configured feed means no posts. Show the page itself as the
		// honest fallback rather than inventing content.
		return (
			<a
				href={FACEBOOK_PAGE_URL}
				target="_blank"
				rel="noreferrer"
				className="flex max-w-md flex-col rounded-card border border-dashed border-rule-strong bg-card/60 p-8 text-left transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
				data-testid="facebook-carousel-empty"
			>
				<span className="t-eyebrow">Facebook</span>
				<span className="t-h3 mt-2 text-foreground">
					Follow our page for the latest updates
				</span>
				<span className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
					Announcements, events and campus news are posted regularly on the
					school&apos;s Facebook timeline.
				</span>
				<span className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-foreground">
					Visit facebook.com/eebssbutwal
					<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
				</span>
			</a>
		);
	}

	return (
		<div className="w-full">
			<Carousel
				opts={{
					align: "start",
					loop: true,
				}}
				className="w-full"
			>
				<CarouselContent className="-ml-4">
					{posts.map((post) => (
						<CarouselItem
							key={post.id}
							className="pl-4 md:basis-1/2 lg:basis-1/3"
						>
							<a
								href={post.permalink_url}
								target="_blank"
								rel="noreferrer"
								className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
							>
								{post.full_picture && (
									<div className="mb-6 h-[200px] w-full shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
										<img
											src={post.full_picture}
											alt={post.message.slice(0, 100) || "Facebook post"}
											loading="lazy"
											className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
										/>
									</div>
								)}
								<div className="flex flex-col flex-grow">
									<div className="flex justify-between items-start gap-4">
										<span className="t-eyebrow">
											{formatDistanceToNow(new Date(post.created_time), {
												addSuffix: true,
											})}
										</span>
										<span className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
											<ExternalLink size={18} />
										</span>
									</div>
									<p className="mt-4 font-display text-[15px] leading-snug text-foreground whitespace-pre-wrap flex-grow line-clamp-3">
										{post.message}
									</p>
								</div>
							</a>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="flex justify-end gap-2 mt-6 mr-2">
					<CarouselPrevious className="static transform-none translate-y-0 h-10 w-10 border-border bg-background hover:bg-secondary text-foreground rounded-full shadow-sm" />
					<CarouselNext className="static transform-none translate-y-0 h-10 w-10 border-border bg-background hover:bg-secondary text-foreground rounded-full shadow-sm" />
				</div>
			</Carousel>
		</div>
	);
}
