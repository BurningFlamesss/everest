import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Settings } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { getSettings, listBranches } from "./website-DZTFoYsv.mjs";
import { ModulePlaceholder } from "./ModulePlaceholder-DfEVKITo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-0NqWNW_n.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { data: settings } = useQuery({
		queryKey: ["settings"],
		queryFn: getSettings
	});
	const { data: branches = [] } = useQuery({
		queryKey: ["branches"],
		queryFn: listBranches
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulePlaceholder, {
		testId: "settings-page",
		eyebrow: "System",
		title: "Settings",
		description: "School profile, organisation structure, security policy, website and notification preferences.",
		icon: Settings,
		stats: [
			{
				key: "school",
				label: "School",
				value: settings?.shortName ?? "—",
				hint: settings?.city
			},
			{
				key: "branches",
				label: "Branches",
				value: String(branches.length)
			},
			{
				key: "site",
				label: "Public site",
				value: settings ? settings.publicSite.enabled ? "Live" : "Offline" : "—"
			},
			{
				key: "mfa",
				label: "Admin MFA",
				value: settings ? settings.security.requireMfaForAdmins ? "Required" : "Optional" : "—"
			}
		],
		capabilities: [
			"School profile: name, tagline, contact details, branding and social profiles.",
			"Organisation: branches and academic years, including setting the current year.",
			"Users & security: password policy, session timeout, admin MFA and guardian self-signup.",
			"Website and notification preferences with per-rule email / SMS / in-app toggles."
		]
	});
}
var SplitComponent = SettingsPage;
//#endregion
export { SplitComponent as component };
