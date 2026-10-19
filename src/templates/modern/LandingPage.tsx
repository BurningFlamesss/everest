import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Building2, Info } from "lucide-react";
import { NoticeDialog } from "#/components/common/NoticeDialog";
import { ResultsChart } from "#/templates/modern/components/utilities/ResultsChart";
import { albums } from "#/content/gallery";
import { people } from "#/lib/faculty";
import { SectionHeading } from "#/templates/modern/components/chrome/PageFrame";
import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { rows, str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import type { BlockType } from "#/types";
import type { WebsitePageContent } from "#/lib/website-content-loader";

import { useQuery } from "@tanstack/react-query";
import { getFacebookPostsServer } from "#/packages/content/server/facebook.ts";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel.jsx";


gsap.registerPlugin(ScrollTrigger);

interface LandingCmsContent {
	/** Published (or preview) CMS page for the home key; null → static defaults. */
	page: WebsitePageContent | null;
	/** True when rendered inside the admin live-preview iframe (?cms=1). */
	preview: boolean;
}

/** Merge a section's defaults with any saved CMS overrides. */
function useSection(page: WebsitePageContent | null, type: BlockType) {
	return { ...sectionDefaults(type), ...getSectionFields(page?.blocks as never, type) } as Record<string, unknown>;
}

const DISCOVER_ICONS: Record<string, typeof BookOpen> = {
	"/courses": BookOpen,
	"/facilities": Building2,
	"/about": Info,
};

export default function LandingPage({ page = null, preview = false }: Partial<LandingCmsContent> = {}) {
	const containerRef = useRef<HTMLDivElement>(null);

	const hero = useSection(page, "landing_hero");
	const facts = useSection(page, "landing_facts");
	const discover = useSection(page, "discover_cards");
	const headings = useSection(page, "landing_section_headings");

	const onSelectSection = (sectionType: BlockType) => {
		if (typeof window !== "undefined" && window.parent) {
			window.parent.postMessage(
				{ source: "scms-cms", type: "select-section", pageKey: "home", sectionType },
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
						end: "bottom top",
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
				<div ref={containerRef} className="relative h-[600vh]">
					<div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
						<HeroCanvas scrollTrackRef={containerRef} />
						
						{/* Dark Vignette Overlay for Text Legibility */}
						<div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/40 via-transparent to-black/60" />

						{/* Scroll-triggered Overlays */}
						<CmsSectionBox preview={preview} sectionType="landing_hero" onSelect={onSelectSection} testId="cms-section-hit-landing_hero">
						<div className="pointer-events-none absolute inset-0 z-10 flex lg:pl-[var(--nav-w)]">
							<div className="relative h-full w-full p-8 lg:p-16">
								{/* Text 1: Visible by default, Appears Top Right */}
								<div className="scroll-text-1 absolute right-8 top-1/4 max-w-lg text-right text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:right-24">
									<h2 className="font-display text-5xl font-bold leading-tight md:text-7xl">
										{str(hero, "text1Title", "A place to grow.")}
									</h2>
									<p className="mt-4 text-lg font-medium text-white/95 md:text-xl">
										{str(hero, "text1Body", "Developing character, capability, and curiosity since 2050 BS.")}
									</p>
								</div>

								{/* Text 2: Appears Bottom Left (relative to layout) */}
								<div className="scroll-text-2 absolute bottom-24 left-8 max-w-xl translate-y-[20px] text-white opacity-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:left-24">
									<h2 className="font-display text-5xl font-bold leading-tight md:text-7xl">
										{str(hero, "text2Title", "Future ready.")}
									</h2>
									<p className="mt-4 text-lg font-medium text-white/95 md:text-xl">
										{str(hero, "text2Body", "Our state-of-the-art facilities and modern curriculums empower students to thrive in an evolving world.")}
									</p>
								</div>

								{/* Text 3: Appears Center */}
								<div className="scroll-text-3 absolute inset-0 flex flex-col items-center justify-center text-center text-white opacity-0 translate-y-[20px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
									<div className="max-w-3xl px-6">
										<h2 className="font-display text-5xl font-bold leading-tight md:text-8xl">
											{str(hero, "text3Title", "Everest.")}
										</h2>
										<p className="mt-4 text-xl font-medium text-white/95 md:text-2xl">
											{str(hero, "text3Body", "The summit of education.")}
										</p>
									</div>
								</div>
							</div>
						</div>
						</CmsSectionBox>
					</div>

					<section className="hero-next-section absolute bottom-0 left-0 z-10 w-full overflow-y-auto overflow-x-hidden bg-[#FEF2F2] rounded-t-3xl min-h-[70vh] lg:h-[80vh]">
						<CmsSectionBox preview={preview} sectionType="landing_facts" onSelect={onSelectSection} testId="cms-section-hit-landing_facts">
						<div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr] mx-6 md:mx-12 lg:mx-20 pt-10 pb-16 lg:pt-20 lg:pb-0 gap-10 lg:gap-[8%]">
							<h2 className="text-5xl md:text-6xl lg:text-8xl font-bold text-foreground whitespace-pre-line">
								{str(facts, "title", "Established in purpose.\nContemporary in outlook.")}
							</h2>
							<div>
								<p className="text-base md:text-lg leading-normal mb-8 text-muted-foreground">
									{str(facts, "body", "")}
								</p>
								<dl className="border-t border-rule-soft">
									{rows(facts, "facts").map((fact, i) => (
										<div key={i} className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-5 py-4 lg:py-5 border-b border-rule-soft">
											<dt className="text-[11px] sm:text-xs uppercase text-muted-foreground tracking-wider">{String(fact.label ?? "")}</dt>
											<dd className="text-sm sm:text-md font-medium text-foreground">
												{String(fact.value ?? "")}
											</dd>
										</div>
									))}
								</dl>
							</div>
						</div>
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
								description={str(headings, "resultsDesc", "Consistent performance across all levels of examination.")}
							/>
							<div className="mt-12 rounded-card border border-border bg-card p-6 shadow-sm sm:p-10">
								<ResultsChart />
							</div>
						</div>

						{/* Discover / About / Courses / Facilities */}
						<div className="mb-32">
							<CmsSectionBox preview={preview} sectionType="landing_section_headings" onSelect={onSelectSection} testId="cms-section-hit-landing_section_headings">
								<SectionHeading
									eyebrow={str(headings, "discoverEyebrow", "Explore Everest")}
									title={str(headings, "discoverTitle", "Discover the school")}
									description={str(headings, "discoverDesc", "Learn more about our academic programs, state-of-the-art facilities, and the institution's history.")}
								/>
							</CmsSectionBox>
							<CmsSectionBox preview={preview} sectionType="discover_cards" onSelect={onSelectSection} testId="cms-section-hit-discover_cards">
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{rows(discover, "cards").map((card, i) => {
									const href = str(card, "href", "/");
									const Icon = DISCOVER_ICONS[href] ?? Info;
									return (
										<Link key={i} to={href as never} className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
												<Icon className="h-6 w-6 text-accent" aria-hidden="true" />
											</div>
											<p className="t-eyebrow mt-6">{str(card, "eyebrow")}</p>
											<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
												{str(card, "title")}
											</h3>
											<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
												{str(card, "body")}
											</p>
											<span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
												{str(card, "ctaLabel", "Learn more")}
												<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
											</span>
										</Link>
									);
								})}
							</div>
							</CmsSectionBox>
						</div>

						{/* Gallery */}
						<div className="mb-32">
							<SectionHeading
								eyebrow={str(headings, "galleryEyebrow", "Campus Life")}
								title={str(headings, "galleryTitle", "Gallery Highlights")}
								description={str(headings, "galleryDesc", "Moments captured around the school grounds and during major events.")}
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{albums.slice(0, 3).map((album) => (
									<Link key={album.id} to="/gallery" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
										<div className="mb-6 h-[200px] w-full overflow-hidden rounded-md border border-border bg-secondary">
											<img 
												src={album.photos[0].src} 
												alt={album.photos[0].alt}
												className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
											/>
										</div>
										<p className="t-eyebrow mt-auto">{album.year} · {album.category}</p>
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
								description={str(headings, "updatesDesc", "News and events from our community timeline.")}
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
								description={str(headings, "facultyDesc", "The educators leading our academic departments and steering the school's vision.")}
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{people.filter((p) => p.leadership).slice(0, 3).map((person) => (
									<Link key={person.id} to="/faculty" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
										<MonogramAvatar
											name={person.name}
											department={person.department}
											size="lg"
										/>
										<p className="t-eyebrow mt-6">{person.role}</p>
										<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
											{person.name}
										</h3>
										<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
											{person.qualification}
										</p>
										<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4">
											<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground">
												{person.department}
											</span>
											<span className="t-meta">Ext. {person.extension}</span>
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
}

export function HeroCanvas({ scrollTrackRef }: { scrollTrackRef: React.RefObject<HTMLDivElement | null> }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { drawFrame, frameCount, isLoading, progress, ready } = useCanvasVideo(
		canvasRef,
		216,
	);

	// Ensure active frame is drawn whenever ready or when loading completes
	useEffect(() => {
		if (ready && !isLoading) {
			requestAnimationFrame(() => {
				const start = ScrollTrigger.getById("hero-scroll");
				const index = start ? Math.floor(start.progress * (frameCount - 1)) : 0;
				drawFrame(index);
			});
		}
	}, [ready, isLoading, drawFrame, frameCount]);

	useEffect(() => {
		if (!ready) return;

		const handleResize = () => {
			const start = ScrollTrigger.getById("hero-scroll");

			if (start) {
				drawFrame(start.progress * (frameCount - 1));
			} else {
				drawFrame(0);
			}
		};

		addEventListener("resize", handleResize);

		const timeline = gsap.timeline({
			scrollTrigger: {
				id: "hero-scroll",
				trigger: scrollTrackRef.current,
				start: "top top",
				end: "bottom bottom",
				scrub: true,
				onUpdate: (self) => {
					const frameIndex = Math.floor(self.progress * (frameCount - 1));
					drawFrame(frameIndex);
				},
			},
		});

		timeline.to(".scroll-text-1", { opacity: 0, y: -20, duration: 1, ease: "power1.inOut" }, 1.5)
				.to(".scroll-text-2", { opacity: 1, y: 0, duration: 1, ease: "power1.inOut" }, 3)
				.to(".scroll-text-2", { opacity: 0, y: -20, duration: 1, ease: "power1.inOut" }, 5.5)
				.to(".scroll-text-3", { opacity: 1, y: 0, duration: 1, ease: "power1.inOut" }, 7)
				.to(".scroll-text-3", { opacity: 0, y: -20, duration: 1, ease: "power1.inOut" }, 9.5);

		// Trigger initial frame draw after GSAP ScrollTrigger setup
		const currentScroll = ScrollTrigger.getById("hero-scroll");
		const initialIndex = currentScroll ? Math.floor(currentScroll.progress * (frameCount - 1)) : 0;
		drawFrame(initialIndex);

		return () => {
			removeEventListener("resize", handleResize);
			ScrollTrigger.getById("hero-scroll")?.kill();
			timeline.kill();
		};
	}, [ready, drawFrame, scrollTrackRef, frameCount]);

	return (
		<div className="relative w-full h-full bg-black">
			{isLoading && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
					<div className="text-center">
						<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<h1 className="text-lg font-medium">Loading Experience</h1>
						<p className="text-sm text-muted-foreground mt-1">{Math.round(progress)}%</p>
					</div>
				</div>
			)}
			<canvas
				ref={canvasRef}
				className="block w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
			/>
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
    return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-border border-t-ring animate-spin" /></div>;
  }

  if (posts.length === 0) return null;

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
            <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <a href={post.permalink_url} target="_blank" rel="noreferrer" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                {post.full_picture && (
                  <div className="mb-6 h-[200px] w-full shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                    <img
                      src={post.full_picture}
                      alt="Facebook Post Media"
                      className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4">
                    <span className="t-eyebrow">
                      {formatDistanceToNow(new Date(post.created_time), { addSuffix: true })}
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
