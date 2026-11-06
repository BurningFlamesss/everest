import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "#/packages/school/meta.ts";
import About from "#/templates/modern/About.tsx";

export const Route = createFileRoute("/about")({
	head: () =>
		pageMeta({
			title: "About the school",
			description:
				"Our story, programmes and the approach that shapes teaching at Everest English Boarding Higher Secondary School.",
		}),
	component: RouteComponent,
});

function RouteComponent() {
	return <About />;
}
