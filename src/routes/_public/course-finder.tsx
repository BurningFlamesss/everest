import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { STREAM_NAMES } from "#/lib/quiz";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { StreamChooser } from "#/templates/modern/components/interactions/StreamChooser";
import { StreamCompare } from "#/templates/modern/components/interactions/StreamCompare";
import type { BlockType, QuizStreamId } from "#/types";

export const Route = createFileRoute("/_public/course-finder")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "course_finder" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("course_finder");
	const preview = String(cms ?? "") === "1";
	const cmsData = preview ? previewPage : publishedContent;

	// The quiz's choices actually lead somewhere: the top-two ranked streams
	// seed the side-by-side comparison, and "see all" carries them along to
	// the courses page so the visitor lands on a stream that matches their
	// answers rather than the default science level.
	const [compare, setCompare] = useState<{
		left: QuizStreamId;
		right: QuizStreamId;
	} | null>(null);

	const handleHandoff = (top: [QuizStreamId, QuizStreamId]) => {
		setCompare({ left: top[0], right: top[1] });
		// The comparison mounts on the next render, so wait for it before
		// scrolling. Reduced-motion visitors skip the animation.
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		window.setTimeout(() => {
			document.getElementById("stream-compare")?.scrollIntoView({
				behavior: reduced ? "auto" : "smooth",
				block: "start",
			});
		}, 80);
	};

	const handleSeeAll = (top: [QuizStreamId, QuizStreamId]) => {
		// Only Science and Management exist as full programme levels today;
		// Humanities +2 content lives in the quiz and comparison only.
		const levelFor: Record<QuizStreamId, string | undefined> = {
			science: "plus2-science",
			management: "plus2-management",
			humanities: undefined,
		};
		const target = levelFor[top[0]] ?? levelFor[top[1]] ?? "plus2-science";
		navigate({ to: "/courses", search: { level: target } });
	};

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "course_finder",
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
				testId="cms-section-hit-course-finder-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "Course finder"}
					title={str(headerSection, "title") || "Which stream"}
					lead={
						str(headerSection, "body") ||
						"Six questions. The result shows all three streams and why each one ranked where it did."
					}
				/>
			</CmsSectionBox>
			<div className="mt-10">
				<StreamChooser onHandoff={handleHandoff} onSeeAll={handleSeeAll} />
			</div>

			{compare ? (
				<Section>
					<SectionHeading
						eyebrow="Your top two"
						title={`${STREAM_NAMES[compare.left]} next to ${
							STREAM_NAMES[compare.right]
						}`}
						aside={
							<button
								type="button"
								onClick={() => setCompare(null)}
								data-testid="compare-dismiss"
								className="u-label text-muted-foreground transition-colors duration-fast hover:text-foreground"
							>
								Dismiss this comparison
							</button>
						}
						testId="course-finder-compare-heading"
					/>
					<Reveal>
						<StreamCompare
							left={compare.left}
							right={compare.right}
							onLeft={(v) => setCompare({ ...compare, left: v })}
							onRight={(v) => setCompare({ ...compare, right: v })}
						/>
					</Reveal>
				</Section>
			) : null}
		</PageFrame>
	);
}
