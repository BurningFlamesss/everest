import { PageContentManager } from "#/pages/admin/website/PageContentManager";

export default function CoursesContentPage() {
	return (
		<PageContentManager
			pageKey="courses"
			title="Courses Page"
			description="Edit the public courses page: header, academic levels, programme-index copy, fee notes and weekly routines."
			publicPath="/courses"
			sectionTypes={["headline", "academics"]}
			recordsLink={{
				to: "/admin/programmes",
				label: "Manage programme records",
			}}
		/>
	);
}
