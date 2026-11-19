import { PageContentManager } from "#/pages/admin/website/PageContentManager";

export default function AboutContentPage() {
	return (
		<PageContentManager
			pageKey="about"
			title="About Page"
			description="Edit the public about page: header, every chapter, gallery, visiting note and empty-state copy. Every field mirrors the dedicated editor."
			publicPath="/about"
			sectionTypes={["chapters"]}
		/>
	);
}
