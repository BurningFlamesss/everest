import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/clubs_/$slug/posts_/$postId")({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/activities/$postId",
			params: { postId: params.postId },
		});
	},
	component: () => null,
});
