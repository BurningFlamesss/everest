import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Bus } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { listRoutes, listVehicles } from "./operations-gGGfOgxw.mjs";
import { ModulePlaceholder } from "./ModulePlaceholder-DfEVKITo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transportation-ZoYkYP82.js
var import_jsx_runtime = require_jsx_runtime();
function TransportationPage() {
	const { data: routes = [] } = useQuery({
		queryKey: ["routes", ""],
		queryFn: () => listRoutes("")
	});
	const { data: vehicles = [] } = useQuery({
		queryKey: ["vehicles", ""],
		queryFn: () => listVehicles("")
	});
	const riders = new Set(routes.flatMap((r) => r.assignedStudentIds)).size;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulePlaceholder, {
		testId: "transportation-page",
		eyebrow: "Operations",
		title: "Transportation",
		description: "Routes, stops, vehicles and drivers with rider assignments per route.",
		icon: Bus,
		stats: [
			{
				key: "routes",
				label: "Routes",
				value: String(routes.length)
			},
			{
				key: "vehicles",
				label: "Vehicles",
				value: String(vehicles.length)
			},
			{
				key: "stops",
				label: "Stops",
				value: String(routes.reduce((sum, r) => sum + r.stops.length, 0))
			},
			{
				key: "riders",
				label: "Students riding",
				value: String(riders)
			}
		],
		capabilities: [
			"Route list with stop sequence, pickup and drop timings, and assigned riders.",
			"Fleet table: registration, capacity, service dates, insurance expiry and GPS state.",
			"Driver roster with licence details and availability status.",
			"Suspend or reactivate a route and reassign its vehicle."
		]
	});
}
var SplitComponent = TransportationPage;
//#endregion
export { SplitComponent as component };
