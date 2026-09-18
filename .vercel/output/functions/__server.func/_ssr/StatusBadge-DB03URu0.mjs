import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-DB03URu0.js
var import_jsx_runtime = require_jsx_runtime();
var TONE_CLASS = {
	neutral: "bg-muted text-muted-foreground",
	success: "bg-success/12 text-success",
	warning: "bg-warning/18 text-warning",
	danger: "bg-destructive/12 text-destructive",
	info: "bg-info/12 text-info",
	accent: "bg-accent/14 text-accent",
	primary: "bg-primary/12 text-primary"
};
var DOT_CLASS = {
	neutral: "bg-muted-foreground",
	success: "bg-success",
	warning: "bg-warning",
	danger: "bg-destructive",
	info: "bg-info",
	accent: "bg-accent",
	primary: "bg-primary"
};
/** Single source of truth for every status word used across the product. */
var STATUS_MAP = {
	active: {
		label: "Active",
		tone: "success"
	},
	inactive: {
		label: "Inactive",
		tone: "neutral"
	},
	graduated: {
		label: "Graduated",
		tone: "info"
	},
	transferred: {
		label: "Transferred",
		tone: "warning"
	},
	suspended: {
		label: "Suspended",
		tone: "danger"
	},
	probation: {
		label: "Probation",
		tone: "warning"
	},
	on_leave: {
		label: "On leave",
		tone: "info"
	},
	retired: {
		label: "Retired",
		tone: "neutral"
	},
	terminated: {
		label: "Terminated",
		tone: "danger"
	},
	invited: {
		label: "Invited",
		tone: "accent"
	},
	deactivated: {
		label: "Deactivated",
		tone: "neutral"
	},
	pending: {
		label: "Pending",
		tone: "accent"
	},
	activated: {
		label: "Activated",
		tone: "success"
	},
	expired: {
		label: "Expired",
		tone: "danger"
	},
	revoked: {
		label: "Revoked",
		tone: "danger"
	},
	none: {
		label: "—",
		tone: "neutral"
	},
	draft: {
		label: "Draft",
		tone: "neutral"
	},
	scheduled: {
		label: "Scheduled",
		tone: "info"
	},
	published: {
		label: "Published",
		tone: "success"
	},
	archived: {
		label: "Archived",
		tone: "neutral"
	},
	ongoing: {
		label: "Ongoing",
		tone: "accent"
	},
	completed: {
		label: "Completed",
		tone: "neutral"
	},
	cancelled: {
		label: "Cancelled",
		tone: "danger"
	},
	low: {
		label: "Low",
		tone: "neutral"
	},
	normal: {
		label: "Normal",
		tone: "primary"
	},
	high: {
		label: "High",
		tone: "accent"
	},
	urgent: {
		label: "Urgent",
		tone: "danger"
	},
	present: {
		label: "Present",
		tone: "success"
	},
	absent: {
		label: "Absent",
		tone: "danger"
	},
	late: {
		label: "Late",
		tone: "accent"
	},
	excused: {
		label: "Excused",
		tone: "info"
	},
	accepted: {
		label: "Accepted",
		tone: "success"
	},
	rejected: {
		label: "Rejected",
		tone: "danger"
	},
	waitlisted: {
		label: "Waitlisted",
		tone: "accent"
	},
	converted: {
		label: "Enrolled",
		tone: "primary"
	},
	paid: {
		label: "Paid",
		tone: "success"
	},
	partial: {
		label: "Partial",
		tone: "accent"
	},
	unpaid: {
		label: "Unpaid",
		tone: "warning"
	},
	overdue: {
		label: "Overdue",
		tone: "danger"
	},
	void: {
		label: "Void",
		tone: "neutral"
	},
	succeeded: {
		label: "Succeeded",
		tone: "success"
	},
	failed: {
		label: "Failed",
		tone: "danger"
	},
	refunded: {
		label: "Refunded",
		tone: "info"
	},
	maintenance: {
		label: "Maintenance",
		tone: "warning"
	},
	public: {
		label: "Public",
		tone: "success"
	},
	internal: {
		label: "Internal",
		tone: "info"
	},
	private: {
		label: "Private",
		tone: "neutral"
	},
	planning: {
		label: "Planning",
		tone: "info"
	},
	closed: {
		label: "Closed",
		tone: "neutral"
	}
};
function StatusBadge({ value, label, dot = true, className, testId }) {
	const entry = STATUS_MAP[value] ?? {
		label: label ?? value,
		tone: "neutral"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", TONE_CLASS[entry.tone], className),
		"data-testid": testId,
		"data-status": value,
		children: [dot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[entry.tone]) }), label ?? entry.label]
	});
}
//#endregion
export { StatusBadge };
