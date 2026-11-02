import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "#/templates/modern/LandingPage.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main>
			<LandingPage />
		</main>
	);
}
