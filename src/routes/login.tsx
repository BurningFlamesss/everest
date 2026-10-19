import { createFileRoute, useSearch, redirect } from "@tanstack/react-router";
import { AuthPage } from "#/components/public/AuthBlocks";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import {
	useSchoolConfig,
	useWebsitePageContent,
} from "#/packages/school/hook.tsx";
import type { BlockType } from "#/types";
import { PageShell } from "#/templates/modern/components/layout/PageShell";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context, location }) => {
		const search = location.search as any;
		if (String(search.cms) === "1" || String(search["allow-when-logged-in"]) === "true") {
			return; // allow CMS preview
		}
		if (context.session) {
			const role = context.session.user.role;
			if (role === "admin" || role === "super_admin") {
				throw redirect({ to: "/admin/overview" });
			}
			throw redirect({ to: "/user" }); // or wherever normal users go
		}
	},
	loader: async ({ location }) => {
		if (String(location.search.cms ?? "") === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "login" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const config = useSchoolConfig();
	const published = useWebsitePageContent("login");
	const preview = String(cms ?? "") === "1";
	const loginPage = preview ? previewPage : published;

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "login",
				sectionType,
			},
			"*",
		);
	};

	return (
		<PageShell>
			<AuthPage
				blocks={loginPage?.blocks ?? null}
				orgName={config.organization.name}
				preview={preview}
				onSelectSection={onSelectSection}
			/>
		</PageShell>
	);
}
