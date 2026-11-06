import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "#/packages/school/meta.ts";
import LandingPage from "#/templates/modern/LandingPage.tsx";

export const Route = createFileRoute("/")({
	head: () =>
		pageMeta({ title: "Everest English Boarding Higher Secondary School" }),
	component: Home,
});

function Home() {
	return (
		<main>
			<LandingPage />
		</main>
	);
}
