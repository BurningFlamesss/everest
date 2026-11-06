import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bell, CalendarDays, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "#/components/layout/Footer.tsx";
import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { useSchoolConfig } from "#/packages/school/hook.tsx";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAMES = 216;
const MOBILE_FRAMES = 108;

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export default function LandingPage() {
	const config = useSchoolConfig();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (prefersReducedMotion()) {
			gsap.set(".hero-next-section", { yPercent: 0, clipPath: "none" });
			return;
		}

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
		<main className="w-full">
			<div ref={containerRef} className="relative h-[500vh]">
				<div className="sticky top-0 h-screen w-full overflow-hidden bg-foreground">
					<HeroCanvas scrollTrackRef={containerRef} />

					<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-8 sm:px-6 md:pb-14 md:pl-80 md:pr-16">
						<div className="pointer-events-auto max-w-2xl rounded-2xl bg-background/92 p-5 shadow-xl backdrop-blur-sm md:rounded-3xl md:p-8">
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs">
								Admissions open · {config.organization.address}
							</p>
							<h1 className="mt-2 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-5xl">
								{config.organization.name}
							</h1>
							<p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
								{config.organization.tagline}
							</p>
							<div className="mt-4 flex flex-wrap gap-2 md:gap-3">
								<Link
									to="/contact"
									hash="enquiry"
									className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 md:px-5 md:py-2.5 md:text-sm"
								>
									<GraduationCap className="h-4 w-4" /> Admissions enquiry
								</Link>
								<Link
									to="/notices"
									className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted md:px-5 md:py-2.5 md:text-sm"
								>
									<Bell className="h-4 w-4" /> Notices
								</Link>
								<Link
									to="/events"
									className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted md:px-5 md:py-2.5 md:text-sm"
								>
									<CalendarDays className="h-4 w-4" /> Events
								</Link>
							</div>
						</div>
					</div>
				</div>

				<section className="hero-next-section absolute bottom-0 left-0 z-10 h-[80vh] w-full overflow-hidden rounded-t-3xl bg-card">
					<div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pt-10 md:grid-cols-[6fr_5fr] md:gap-[8%] md:px-10 md:pt-20">
						<h2 className="font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
							Established in purpose.
							<br />
							Contemporary in outlook.
						</h2>
						<div>
							<p className="mb-8 text-base leading-normal text-muted-foreground md:text-lg">
								{config.organization.name} is a learning institution in Nepal
								built around a simple conviction: students thrive when
								expectations are clear, relationships are strong, and curiosity
								has room to become practice.
							</p>
							<dl className="border-t border-border">
								{[
									["Institution", config.organization.name],
									["Learning Spaces", "Everest Building + Canon Building"],
									["Streams", "Science (Computer/Biology), Management"],
									["Labs", "Computer, Biology, Physics, Chemistry"],
								].map(([label, value]) => (
									<div
										key={label}
										className="grid grid-cols-[120px_1fr] gap-5 border-b border-border p-4 md:grid-cols-[140px_1fr]"
									>
										<dt className="text-xs uppercase text-muted-foreground">
											{label}
										</dt>
										<dd className="text-sm font-medium text-foreground md:text-base">
											{value}
										</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
				</section>
			</div>

			<Footer />
		</main>
	);
}

export function HeroCanvas({
	scrollTrackRef,
}: {
	scrollTrackRef: React.RefObject<HTMLDivElement | null>;
}) {
	const config = useSchoolConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [frameCount, setFrameCount] = useState(DESKTOP_FRAMES);

	useEffect(() => {
		// Halve the frame budget on small screens so the hero does not compete
		// with the page for bandwidth on a phone connection.
		if (window.matchMedia("(max-width: 768px)").matches) {
			setFrameCount(MOBILE_FRAMES);
		}
	}, []);

	const {
		drawFrame,
		frameCount: loadedFrames,
		isLoading,
		progress,
	} = useCanvasVideo(canvasRef, frameCount);

	useEffect(() => {
		if (isLoading) return;

		drawFrame(0);

		if (prefersReducedMotion()) {
			return;
		}

		const handleResize = () => {
			const start = ScrollTrigger.getById("hero-scroll");

			if (start) {
				drawFrame(start.progress * (loadedFrames - 1));
			}
		};

		addEventListener("resize", handleResize);

		const timeline = gsap.timeline({
			scrollTrigger: {
				id: "hero-scroll",
				trigger: scrollTrackRef.current,
				start: "top top",
				end: "bottom bottom",
				scrub: 0,
				onUpdate: (self) => {
					const frameIndex = Math.floor(self.progress * (loadedFrames - 1));
					drawFrame(frameIndex);
				},
			},
		});

		return () => {
			removeEventListener("resize", handleResize);
			ScrollTrigger.getById("hero-scroll")?.kill();
			timeline.kill();
		};
	}, [isLoading, drawFrame, scrollTrackRef, loadedFrames]);

	return (
		<div className="relative h-full w-full">
			<img
				src="/landing-footage/frame_0001.jpeg"
				alt=""
				aria-hidden="true"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<canvas
				ref={canvasRef}
				className="relative block h-full w-full object-cover filter contrast-[1.05] saturate-[1.05]"
			/>

			{isLoading ? (
				<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-foreground/70 px-6 text-center text-background">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
						{config.organization.shortName ?? "Everest"}
					</p>
					<h2 className="mt-3 max-w-lg font-display text-3xl font-bold md:text-5xl">
						Loading the campus experience
					</h2>
					<div
						role="progressbar"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(progress)}
						className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-background/20"
					>
						<div
							className="h-full bg-accent transition-[width] duration-200"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="mt-2 text-xs text-background/60">
						{Math.round(progress)}%
					</p>
				</div>
			) : null}
		</div>
	);
}
