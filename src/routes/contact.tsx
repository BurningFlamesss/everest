import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "#/packages/school/meta.ts";
import Contact from "#/templates/modern/Contact.tsx";

export const Route = createFileRoute("/contact")({
	head: () =>
		pageMeta({
			title: "Contact and admissions",
			description:
				"Contact the school office about admissions, records, transport or a campus visit — or send an enquiry from this page.",
		}),
	component: RouteComponent,
});

function RouteComponent() {
	return <Contact />;
}
