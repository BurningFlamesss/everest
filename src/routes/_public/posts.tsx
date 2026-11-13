import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { getFacebookPostsServer } from "#/packages/content/server/facebook";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import {
	PageFrame,
	PageHeader,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

import { RevealUp } from "#/templates/modern/components/motion";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/posts")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "posts" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: PostsRoute,
});

function PostsRoute() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("posts");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as any;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "posts",
				sectionType,
			},
			"*",
		);
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: ["facebook-posts"],
			queryFn: ({ pageParam = 1 }) =>
				getFacebookPostsServer({ data: { page: pageParam, pageSize: 6 } }),
			initialPageParam: 1,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [inView, fetchNextPage, hasNextPage]);

	const posts = data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<PageFrame>
			<CmsSectionBox
				preview={preview}
				sectionType="headline"
				onSelect={onSelectSection}
				testId="cms-section-hit-posts-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "Updates & News"}
					title={str(headerSection, "title") || "Recent Posts"}
					lead={
						str(headerSection, "body") ||
						"Stay up to date with the latest stories, announcements, and events directly from our timeline."
					}
				/>
			</CmsSectionBox>

			<Section className="!mt-10 mb-20 max-w-4xl mx-auto">
				{status === "pending" ? (
					<div className="flex justify-center p-12">
						<div className="w-8 h-8 rounded-full border-2 border-n-200 border-t-accent animate-spin" />
					</div>
				) : status === "error" ? (
					<div className="text-center text-n-600 bg-n-100/50 rounded-xl p-12">
						Failed to load posts. Please try again later.
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{posts.map((post, index) => (
							<RevealUp key={post.id} index={index % 6}>
								<div className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
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
										<div className="flex justify-between items-start mb-4 gap-4">
											<span className="t-eyebrow">
												{formatDistanceToNow(new Date(post.created_time), {
													addSuffix: true,
												})}
											</span>
											<a
												href={post.permalink_url}
												target="_blank"
												rel="noreferrer"
												className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
												aria-label="View on Facebook"
											>
												<ExternalLink size={18} />
											</a>
										</div>
										<p className="mt-2 font-display text-[15px] leading-snug text-foreground whitespace-pre-wrap flex-grow">
											{post.message}
										</p>
									</div>
								</div>
							</RevealUp>
						))}
					</div>
				)}

				<div ref={ref} className="h-16 flex items-center justify-center mt-8">
					{isFetchingNextPage && (
						<div className="w-6 h-6 rounded-full border-2 border-n-200 border-t-accent animate-spin" />
					)}
					{!hasNextPage && posts.length > 0 && (
						<span className="text-n-500 text-sm">
							You have reached the end.
						</span>
					)}
				</div>
			</Section>
		</PageFrame>
	);
}
