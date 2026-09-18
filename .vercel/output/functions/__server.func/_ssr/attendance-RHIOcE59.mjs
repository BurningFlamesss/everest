import { __toESM } from "../_runtime.mjs";
import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Camera, CheckCheck, CircleCheck, CircleX, ClipboardCheck, Clock3, Download, FileCheckCorner, Funnel, ImagePlus, LoaderCircle, OctagonAlert, RotateCcw, Save, ScanLine, Search, ShieldAlert, Undo2, UserCog, UserX, Users } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Progress } from "./progress-BR51tDET.mjs";
import { Tabs, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { downloadTextFile, formatDate, formatDateTime, toCsv, todayKey } from "./format-BBWmN55e.mjs";
import { createRng, db, intBetween, latency, uid } from "./db-CgIvOOZs.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { ListSkeleton, PanelSkeleton, TableSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { ScrollArea } from "./scroll-area-Uy1QVTEG.mjs";
import { getAttendanceOverview, getAttendanceStats, getAttendanceTrend, getClassRegister, getStaffRegister, saveClassRegister, saveStaffRegister } from "./academics-BoJkVxby.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { Checkbox } from "./checkbox-BjdMCqoU.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { DateField } from "./DateField-D_49KJt4.mjs";
import { STOCK_LIBRARY, fileToDataUrl } from "./image-C7_1Gwhh.mjs";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/attendance-RHIOcE59.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ATTENDANCE_STATES = [
	{
		value: "present",
		label: "Present",
		short: "P",
		icon: CircleCheck,
		active: "bg-success text-success-foreground",
		dot: "bg-success",
		text: "text-success",
		soft: "bg-success/12 text-success"
	},
	{
		value: "absent",
		label: "Absent",
		short: "A",
		icon: CircleX,
		active: "bg-destructive text-destructive-foreground",
		dot: "bg-destructive",
		text: "text-destructive",
		soft: "bg-destructive/12 text-destructive"
	},
	{
		value: "late",
		label: "Late",
		short: "L",
		icon: Clock3,
		active: "bg-accent text-accent-foreground",
		dot: "bg-accent",
		text: "text-accent",
		soft: "bg-accent/14 text-accent"
	},
	{
		value: "excused",
		label: "Excused",
		short: "E",
		icon: FileCheckCorner,
		active: "bg-info text-info-foreground",
		dot: "bg-info",
		text: "text-info",
		soft: "bg-info/12 text-info"
	}
];
ATTENDANCE_STATES.reduce((acc, meta) => ({
	...acc,
	[meta.value]: meta
}), {});
function rateTone(rate) {
	if (rate >= 92) return "text-success";
	if (rate >= 82) return "text-warning";
	return "text-destructive";
}
function rateBar(rate) {
	if (rate >= 92) return "bg-success";
	if (rate >= 82) return "bg-warning";
	return "bg-destructive";
}
/**
* Four-state segmented marker. One tap per student — the fastest possible way
* to run a register on a laptop or a tablet.
*/
function StateToggle({ value, onChange, disabled = false, compact = false, testIdPrefix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex overflow-hidden rounded-md border border-hairline bg-surface-1",
		role: "group",
		"aria-label": "Attendance state",
		"data-testid": `${testIdPrefix}-toggle`,
		"data-state": value ?? "unmarked",
		children: ATTENDANCE_STATES.map((meta) => {
			const Icon = meta.icon;
			const active = value === meta.value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				"aria-pressed": active,
				"aria-label": meta.label,
				title: meta.label,
				"data-testid": `${testIdPrefix}-${meta.value}`,
				onClick: (event) => {
					event.stopPropagation();
					onChange(meta.value);
				},
				className: cn("inline-flex items-center gap-1.5 border-r border-hairline px-2 text-xs font-medium transition-colors duration-150 last:border-r-0 focus-ring disabled:cursor-not-allowed disabled:opacity-45", compact ? "h-7" : "h-8", active ? meta.active : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: meta.label
					}),
					compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num",
						children: meta.short
					})
				]
			}, meta.value);
		})
	});
}
var REVIEW_THRESHOLD = .82;
function hashString(value) {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
/** Cheap, stable fingerprint of a data URL without walking megabytes of base64. */
function fingerprint(imageUrl) {
	const head = imageUrl.slice(0, 96);
	const tail = imageUrl.slice(-96);
	return `${imageUrl.length}:${head}:${tail}`;
}
async function scanAttendancePhoto(classId, date, imageUrl) {
	const started = Date.now();
	await latency(1600);
	const cls = db().classes.find((c) => c.id === classId);
	if (!cls) throw new Error("Class not found");
	const roster = db().students.filter((s) => s.classId === classId && s.status === "active").sort((a, b) => a.rollNo - b.rollNo);
	const rng = createRng(hashString(`${classId}|${date}|${fingerprint(imageUrl)}`) || 12345);
	const absentTarget = Math.max(1, Math.round(roster.length * (.06 + rng() * .12)));
	const absentIndexes = /* @__PURE__ */ new Set();
	let guard = 0;
	while (absentIndexes.size < absentTarget && guard < 500) {
		absentIndexes.add(intBetween(rng, 0, Math.max(0, roster.length - 1)));
		guard += 1;
	}
	const detections = roster.map((student, index) => {
		const isAbsent = absentIndexes.has(index);
		const roll = rng();
		if (isAbsent) {
			const confidence = .74 + roll * .24;
			return {
				student,
				matched: false,
				confidence: Number(confidence.toFixed(2)),
				proposed: "absent",
				reason: confidence < REVIEW_THRESHOLD ? "No confident match — please verify" : "No matching face in frame"
			};
		}
		const occluded = roll < .08;
		const confidence = occluded ? .66 + roll : .88 + roll * .11;
		return {
			student,
			matched: true,
			confidence: Number(Math.min(.99, confidence).toFixed(2)),
			proposed: "present",
			reason: occluded ? "Partially occluded — please verify" : "Matched in frame"
		};
	});
	const proposedAbsent = detections.filter((d) => d.proposed === "absent");
	const proposedPresent = detections.filter((d) => d.proposed === "present");
	return {
		id: uid("scan"),
		classId,
		className: cls.name,
		date,
		imageUrl,
		scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
		facesFound: proposedPresent.length + (rng() < .4 ? 1 : 0),
		rosterSize: roster.length,
		detections,
		proposedPresent,
		proposedAbsent,
		needsReview: detections.filter((d) => d.confidence < REVIEW_THRESHOLD),
		averageConfidence: detections.length ? Number((detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length).toFixed(2)) : 0,
		durationMs: Date.now() - started
	};
}
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
/**
* Photo-assisted register. The recognition pass is SIMULATED (see
* `services/attendanceScan.ts`) and never writes attendance on its own — the
* proposal always has to be confirmed by a human first.
*/
function PhotoScanDialog({ open, onOpenChange, classId, className, date, onApply }) {
	const fileRef = (0, import_react.useRef)(null);
	const [image, setImage] = (0, import_react.useState)();
	const [result, setResult] = (0, import_react.useState)(null);
	const [confirmed, setConfirmed] = (0, import_react.useState)([]);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [reading, setReading] = (0, import_react.useState)(false);
	const scan = useMutation({
		mutationFn: (dataUrl) => scanAttendancePhoto(classId, date, dataUrl),
		onSuccess: (next) => {
			setProgress(100);
			setResult(next);
			setConfirmed(next.proposedAbsent.map((d) => d.student.id));
		},
		onError: (error) => {
			setProgress(0);
			toast.error(error.message);
		}
	});
	(0, import_react.useEffect)(() => {
		if (!scan.isPending) return;
		setProgress(8);
		const timer = window.setInterval(() => {
			setProgress((value) => value >= 92 ? 92 : value + 7);
		}, 120);
		return () => window.clearInterval(timer);
	}, [scan.isPending]);
	const reset = () => {
		setImage(void 0);
		setResult(null);
		setConfirmed([]);
		setProgress(0);
		scan.reset();
	};
	const pickFile = async (files) => {
		const file = files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file (PNG, JPG or WebP).");
			return;
		}
		setReading(true);
		try {
			const dataUrl = await fileToDataUrl(file, 1400, .75);
			setImage(dataUrl);
			setResult(null);
			scan.mutate(dataUrl);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not read that photo");
		} finally {
			setReading(false);
		}
	};
	const applySample = (url) => {
		setImage(url);
		setResult(null);
		scan.mutate(url);
	};
	const toggle = (id) => {
		setConfirmed((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};
	const apply = () => {
		if (!result) return;
		const states = {};
		result.detections.forEach((detection) => {
			states[detection.student.id] = confirmed.includes(detection.student.id) ? "absent" : "present";
		});
		onApply(states, confirmed.length);
		onOpenChange(false);
		reset();
	};
	const scanning = scan.isPending || reading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (next) => {
			onOpenChange(next);
			if (!next) reset();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-3xl",
			"data-testid": "attendance-scan-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-4 w-4 text-primary" }),
						" Photo register — ",
						className
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Upload a class photo for ",
					formatDate(date),
					". We propose who looks absent; nothing is saved until you confirm and submit the register."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-accent/35 bg-accent/[0.07]",
					"data-testid": "attendance-scan-disclaimer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
							className: "text-sm",
							children: "Simulated recognition (demo)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: "No face data leaves this browser and no real model runs yet. The proposal below is generated deterministically from your photo so you can validate the review-and-confirm workflow that a real scan will use."
						})
					]
				}),
				!image && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					"data-testid": "attendance-scan-upload-step",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						onDragOver: (event) => event.preventDefault(),
						onDrop: (event) => {
							event.preventDefault();
							pickFile(event.dataTransfer.files);
						},
						"data-testid": "attendance-scan-dropzone",
						className: "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-surface-2 px-6 py-10 text-center transition-colors hover:border-primary/45 focus-ring",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: "Drop a class photo or click to browse"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "One wide shot of the room works best · PNG, JPG or WebP"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium text-muted-foreground",
						children: "Or try a sample photo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2",
						children: STOCK_LIBRARY.slice(0, 4).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							title: item.label,
							"data-testid": "attendance-scan-sample",
							onClick: () => applySample(item.url),
							className: "overflow-hidden rounded-lg border border-hairline transition-transform duration-150 hover:scale-[1.02] focus-ring",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.url,
								alt: item.label,
								className: "aspect-[4/3] w-full object-cover",
								loading: "lazy"
							})
						}, item.url))
					})] })]
				}),
				image && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-xl border border-hairline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: image,
								alt: "Class photo being scanned",
								className: "aspect-[4/3] w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "w-full gap-1.5",
							"data-testid": "attendance-scan-reset",
							onClick: reset,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), " Use a different photo"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0",
						children: scanning || !result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-full flex-col justify-center gap-3 rounded-xl border border-hairline bg-surface-2 p-5",
							"data-testid": "attendance-scan-progress",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-medium text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }), "Scanning the frame…"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: progress,
									className: "h-1.5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "num text-xs text-muted-foreground",
									children: [
										progress < 40 ? "Isolating faces" : progress < 75 ? "Matching against the class roster" : "Scoring confidence",
										" ",
										"· ",
										progress,
										"%"
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5",
							"data-testid": "attendance-scan-review",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanStat, {
											label: "On roster",
											value: String(result.rosterSize),
											testId: "scan-stat-roster"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanStat, {
											label: "Faces found",
											value: String(result.facesFound),
											testId: "scan-stat-faces"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanStat, {
											label: "Proposed absent",
											value: String(result.proposedAbsent.length),
											tone: "text-destructive",
											testId: "scan-stat-absent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanStat, {
											label: "Avg confidence",
											value: `${Math.round(result.averageConfidence * 100)}%`,
											testId: "scan-stat-confidence"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow-label",
										children: "Confirm who was absent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-primary underline-offset-2 hover:underline",
										"data-testid": "attendance-scan-toggle-all",
										onClick: () => setConfirmed(confirmed.length === result.proposedAbsent.length ? [] : result.proposedAbsent.map((d) => d.student.id)),
										children: confirmed.length === result.proposedAbsent.length ? "Clear all" : "Select all"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
									className: "h-[220px] rounded-xl border border-hairline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "divide-y divide-hairline",
										children: [result.proposedAbsent.map((detection) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 px-3 py-2.5",
											"data-testid": `attendance-scan-candidate-${detection.student.id}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
													checked: confirmed.includes(detection.student.id),
													onCheckedChange: () => toggle(detection.student.id),
													"aria-label": `Mark ${detection.student.firstName} absent`,
													"data-testid": `attendance-scan-check-${detection.student.id}`
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "min-w-0 flex-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
														name: `${detection.student.firstName} ${detection.student.lastName}`,
														subtitle: `Roll ${detection.student.rollNo} · ${detection.reason}`,
														avatarUrl: detection.student.avatarUrl,
														size: "sm"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfidencePill, { confidence: detection.confidence })
											]
										}, detection.student.id)), result.proposedAbsent.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success" }), " Everyone on the roster was matched in the frame."]
										})]
									})
								})] }),
								result.needsReview.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-warning/35 bg-warning/[0.07] px-3 py-2.5",
									"data-testid": "attendance-scan-needs-review",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-xs font-medium text-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-3.5 w-3.5 text-warning" }),
											result.needsReview.length,
											" match",
											result.needsReview.length === 1 ? "" : "es",
											" scored below",
											" ",
											Math.round(82),
											"% — double-check these faces"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 truncate text-xs text-muted-foreground",
										children: result.needsReview.slice(0, 6).map((d) => `${d.student.firstName} ${d.student.lastName}`).join(" · ")
									})]
								})
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							onOpenChange(false);
							reset();
						},
						"data-testid": "attendance-scan-cancel",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "gap-1.5",
						disabled: !result || scanning,
						"data-testid": "attendance-scan-apply",
						onClick: apply,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-3.5 w-3.5" }), result ? `Apply to register (${confirmed.length} absent)` : "Apply to register"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			className: "hidden",
			"data-testid": "attendance-scan-file-input",
			onChange: (event) => void pickFile(event.target.files)
		})]
	});
}
function ScanStat({ label, value, tone, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-hairline bg-surface-1 px-2.5 py-2",
		"data-testid": testId,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("num mt-0.5 font-display text-base font-semibold leading-none", tone ?? "text-foreground"),
			children: value
		})]
	});
}
function ConfidencePill({ confidence }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("num shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", confidence < .82 ? "bg-warning/18 text-warning" : "bg-muted text-muted-foreground"),
		children: [Math.round(confidence * 100), "%"]
	});
}
function DailyRegister({ date, classId, onClassChange, canMark }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [classSearch, setClassSearch] = (0, import_react.useState)("");
	const [openOnly, setOpenOnly] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)({});
	const [dirty, setDirty] = (0, import_react.useState)(false);
	const [scanOpen, setScanOpen] = (0, import_react.useState)(false);
	const { data: overview, isLoading: overviewLoading } = useQuery({
		queryKey: ["attendance-overview", date],
		queryFn: () => getAttendanceOverview(date)
	});
	const { data: register, isLoading, isError, refetch } = useQuery({
		queryKey: [
			"class-register",
			classId,
			date
		],
		queryFn: () => getClassRegister(classId, date),
		enabled: Boolean(classId)
	});
	(0, import_react.useEffect)(() => {
		if (!register) return;
		const next = {};
		register.entries.forEach((entry) => {
			next[entry.student.id] = {
				state: entry.state,
				note: entry.note
			};
		});
		setDraft(next);
		setDirty(false);
	}, [register]);
	const saveMutation = useMutation({
		mutationFn: () => {
			const entries = Object.entries(draft).filter(([, value]) => value.state !== null).map(([studentId, value]) => ({
				studentId,
				state: value.state,
				note: value.note
			}));
			return saveClassRegister(classId, date, entries, actor);
		},
		onSuccess: (count) => {
			toast.success(`Register submitted for ${count} student${count === 1 ? "" : "s"}`);
			qc.invalidateQueries({ queryKey: ["class-register"] });
			qc.invalidateQueries({ queryKey: ["attendance-overview"] });
			qc.invalidateQueries({ queryKey: ["attendance-stats"] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			qc.invalidateQueries({ queryKey: ["students"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const classes = (0, import_react.useMemo)(() => {
		return (overview?.classes ?? []).filter((row) => {
			if (openOnly && row.marked) return false;
			if (!classSearch.trim()) return true;
			return `${row.cls.name} ${row.cls.roomNo}`.toLowerCase().includes(classSearch.trim().toLowerCase());
		});
	}, [
		overview,
		classSearch,
		openOnly
	]);
	const markedCount = overview?.classes.filter((row) => row.marked).length ?? 0;
	const totalClasses = overview?.classes.length ?? 0;
	const setState = (studentId, state) => {
		setDraft((prev) => ({
			...prev,
			[studentId]: {
				...prev[studentId],
				state
			}
		}));
		setDirty(true);
	};
	const setNote = (studentId, note) => {
		setDraft((prev) => ({
			...prev,
			[studentId]: {
				...prev[studentId],
				note
			}
		}));
		setDirty(true);
	};
	const markAll = (state) => {
		if (!register) return;
		const next = {};
		register.entries.forEach((entry) => {
			next[entry.student.id] = {
				...draft[entry.student.id],
				state
			};
		});
		setDraft(next);
		setDirty(true);
	};
	const resetDraft = () => {
		if (!register) return;
		const next = {};
		register.entries.forEach((entry) => {
			next[entry.student.id] = {
				state: entry.state,
				note: entry.note
			};
		});
		setDraft(next);
		setDirty(false);
	};
	const counts = (0, import_react.useMemo)(() => {
		const values = Object.values(draft);
		const of = (state) => values.filter((v) => v.state === state).length;
		return {
			present: of("present"),
			absent: of("absent"),
			late: of("late"),
			excused: of("excused"),
			unmarked: values.filter((v) => v.state === null).length,
			total: values.length
		};
	}, [draft]);
	const applyScan = (states, absentCount) => {
		setDraft((prev) => {
			const next = { ...prev };
			Object.entries(states).forEach(([studentId, state]) => {
				next[studentId] = {
					...next[studentId],
					state
				};
			});
			return next;
		});
		setDirty(true);
		toast.success(`Photo applied — ${absentCount} marked absent. Review, then submit the register.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				eyebrow: "Registers",
				title: "Classes",
				description: `${markedCount} of ${totalClasses} submitted`,
				bodyClassName: "p-2",
				testId: "attendance-class-rail",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: openOnly ? "secondary" : "ghost",
					size: "sm",
					className: "h-7 gap-1.5 px-2 text-xs",
					"data-testid": "attendance-open-only-toggle",
					onClick: () => setOpenOnly((value) => !value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5" }), " Open only"]
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mb-2 px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: classSearch,
						placeholder: "Find a class…",
						className: "h-8 border-hairline bg-surface-1 pl-8 text-xs",
						"data-testid": "attendance-class-search",
						onChange: (event) => setClassSearch(event.target.value)
					})]
				}), overviewLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 6 })
				}) : classes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					compact: true,
					icon: ClipboardCheck,
					title: "Nothing open",
					description: openOnly ? "Every register for this date has already been submitted." : "No class matches that search.",
					testId: "attendance-class-rail-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-[560px] space-y-0.5 overflow-y-auto",
					"data-testid": "attendance-class-list",
					children: classes.map((row) => {
						const active = row.cls.id === classId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onClassChange(row.cls.id),
							"data-testid": `attendance-class-${row.cls.id}`,
							className: cn("relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors duration-150 focus-ring", active ? "bg-secondary before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px] before:rounded-full before:bg-primary" : "hover:bg-surface-2"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium text-foreground",
									children: row.cls.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num block truncate text-[11px] text-muted-foreground",
									children: [
										"Room ",
										row.cls.roomNo,
										" · ",
										row.total,
										" students"
									]
								})]
							}), row.marked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("num shrink-0 text-xs font-semibold", rateTone(row.rate)),
								children: [row.rate, "%"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 rounded-full bg-accent/14 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent",
								children: "Open"
							})]
						}) }, row.cls.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				eyebrow: "Daily register",
				title: register?.cls.name ?? "Select a class",
				description: register?.marked ? `Submitted by ${register.markedBy} · ${formatDateTime(register.markedAt)}` : "Not submitted yet for this date",
				bodyClassName: "p-0",
				testId: "attendance-register-panel",
				actions: canMark && register ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "attendance-scan-open",
						onClick: () => setScanOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-3.5 w-3.5" }), " Scan photo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "attendance-mark-all-present-button",
						onClick: () => markAll("present"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5" }), " All present"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						disabled: !dirty,
						"data-testid": "attendance-reset-draft",
						onClick: resetDraft,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }), " Reset"]
					})
				] }) : null,
				footer: register ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
						children: [ATTENDANCE_STATES.map((meta) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							"data-testid": `attendance-count-${meta.value}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", meta.dot) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num text-foreground",
									children: counts[meta.value]
								}),
								" ",
								meta.label
							]
						}, meta.value)), counts.unmarked > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "num",
							"data-testid": "attendance-count-unmarked",
							children: [counts.unmarked, " unmarked"]
						})]
					}), canMark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						disabled: !dirty || saveMutation.isPending || counts.total === 0,
						"data-testid": "attendance-save-register",
						onClick: () => saveMutation.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), saveMutation.isPending ? "Submitting…" : dirty ? "Submit register" : "No changes"]
					})]
				}) : null,
				children: isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					onRetry: () => refetch(),
					testId: "attendance-register-error"
				}) : isLoading || !register ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, {
					rows: 8,
					columns: 4
				}) : register.entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Users,
					title: "No active students in this class",
					description: "Enrol students into this class to start running its daily register.",
					testId: "attendance-register-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[760px] border-collapse text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-hairline",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "w-14 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
										children: "Roll"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
										children: "Student"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "w-32 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
										children: "Term rate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
										children: "Note"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
										children: "Mark"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-hairline",
							children: register.entries.map((entry) => {
								const value = draft[entry.student.id] ?? {
									state: entry.state,
									note: entry.note
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "group transition-colors duration-150 hover:bg-surface-2",
									"data-testid": `attendance-row-${entry.student.id}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "num px-4 py-2 text-xs text-muted-foreground",
											children: entry.student.rollNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
												name: `${entry.student.firstName} ${entry.student.lastName}`,
												subtitle: entry.student.admissionNo,
												avatarUrl: entry.student.avatarUrl,
												to: `/students/${entry.student.id}`,
												size: "sm",
												mono: true,
												testId: `attendance-student-link-${entry.student.id}`
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "h-1.5 w-12 overflow-hidden rounded-full bg-surface-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("block h-full rounded-full", rateBar(entry.student.attendanceRate)),
														style: { width: `${entry.student.attendanceRate}%` }
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "num text-xs text-muted-foreground",
													children: [entry.student.attendanceRate, "%"]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: value.note ?? "",
												placeholder: value.state && value.state !== "present" ? "Reason…" : "Add note",
												disabled: !canMark,
												className: "h-8 max-w-[190px] border-hairline bg-surface-1 text-xs",
												"data-testid": `attendance-note-${entry.student.id}`,
												onChange: (event) => setNote(entry.student.id, event.target.value)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateToggle, {
												value: value.state,
												disabled: !canMark,
												onChange: (state) => setState(entry.student.id, state),
												testIdPrefix: `attendance-state-${entry.student.id}`
											})
										})
									]
								}, entry.student.id);
							})
						})]
					})
				})
			}),
			register && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoScanDialog, {
				open: scanOpen,
				onOpenChange: setScanOpen,
				classId: register.cls.id,
				className: register.cls.name,
				date,
				onApply: applyScan
			})
		]
	});
}
function StaffRegister({ date, canMark }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [department, setDepartment] = (0, import_react.useState)("all");
	const [draft, setDraft] = (0, import_react.useState)({});
	const [dirty, setDirty] = (0, import_react.useState)(false);
	const { data: entries = [], isLoading, isError, refetch } = useQuery({
		queryKey: ["staff-register", date],
		queryFn: () => getStaffRegister(date)
	});
	(0, import_react.useEffect)(() => {
		const next = {};
		entries.forEach((entry) => {
			next[entry.staff.id] = entry.state;
		});
		setDraft(next);
		setDirty(false);
	}, [entries]);
	const saveMutation = useMutation({
		mutationFn: () => {
			const payload = Object.entries(draft).filter(([, state]) => state !== null).map(([staffId, state]) => ({
				staffId,
				state
			}));
			return saveStaffRegister(date, payload, actor);
		},
		onSuccess: (count) => {
			toast.success(`Staff attendance saved for ${count} employee${count === 1 ? "" : "s"}`);
			qc.invalidateQueries({ queryKey: ["staff-register"] });
			qc.invalidateQueries({ queryKey: ["attendance-overview"] });
			qc.invalidateQueries({ queryKey: ["overview"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const departments = (0, import_react.useMemo)(() => Array.from(new Set(entries.map((entry) => entry.staff.department))).sort(), [entries]);
	const rows = (0, import_react.useMemo)(() => entries.filter((entry) => {
		if (department !== "all" && entry.staff.department !== department) return false;
		if (!search.trim()) return true;
		const needle = search.trim().toLowerCase();
		return `${entry.staff.firstName} ${entry.staff.lastName} ${entry.staff.employeeId} ${entry.staff.designation}`.toLowerCase().includes(needle);
	}), [
		entries,
		department,
		search
	]);
	const counts = (0, import_react.useMemo)(() => {
		const values = Object.values(draft);
		const of = (state) => values.filter((v) => v === state).length;
		return {
			present: of("present"),
			absent: of("absent"),
			late: of("late"),
			excused: of("excused"),
			unmarked: values.filter((v) => v === null).length
		};
	}, [draft]);
	const markAll = (state) => {
		const next = {};
		entries.forEach((entry) => {
			next[entry.staff.id] = state;
		});
		setDraft(next);
		setDirty(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		eyebrow: "Staff register",
		title: "Staff attendance",
		description: `${entries.length} active employees on the roster`,
		bodyClassName: "p-0",
		testId: "staff-register-panel",
		actions: canMark ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			className: "h-7 gap-1.5 px-2 text-xs",
			"data-testid": "staff-mark-all-present",
			onClick: () => markAll("present"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5" }), " All present"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			className: "h-7 gap-1.5 px-2 text-xs",
			disabled: !dirty,
			"data-testid": "staff-reset-draft",
			onClick: () => {
				const next = {};
				entries.forEach((entry) => {
					next[entry.staff.id] = entry.state;
				});
				setDraft(next);
				setDirty(false);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }), " Reset"]
		})] }) : null,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
				children: [ATTENDANCE_STATES.map((meta) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					"data-testid": `staff-count-${meta.value}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", meta.dot) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-foreground",
							children: counts[meta.value]
						}),
						" ",
						meta.label
					]
				}, meta.value)), counts.unmarked > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "num",
					children: [counts.unmarked, " unmarked"]
				})]
			}), canMark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-1.5",
				disabled: !dirty || saveMutation.isPending,
				"data-testid": "staff-save-register",
				onClick: () => saveMutation.mutate(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), saveMutation.isPending ? "Saving…" : dirty ? "Save attendance" : "No changes"]
			})]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 border-b border-hairline p-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: search,
					placeholder: "Search by name, employee ID or designation…",
					className: "h-9 border-hairline bg-surface-1 pl-8 text-sm",
					"data-testid": "staff-register-search",
					onChange: (event) => setSearch(event.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: department,
				onValueChange: setDepartment,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-9 w-[190px] border-hairline bg-surface-1 text-xs",
					"data-testid": "staff-register-department",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Department" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
					className: "bg-popover",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						className: "text-xs",
						children: "All departments"
					}), departments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: item,
						className: "text-xs",
						children: item
					}, item))]
				})]
			})]
		}), isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			onRetry: () => refetch(),
			testId: "staff-register-error"
		}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, {
			rows: 8,
			columns: 4
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			compact: true,
			icon: UserCog,
			title: "No staff match these filters",
			description: "Try another department or clear the search to see the whole roster.",
			primaryLabel: "Clear filters",
			onPrimary: () => {
				setSearch("");
				setDepartment("all");
			},
			testId: "staff-register-empty"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] border-collapse text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-hairline",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
								children: "Employee"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
								children: "Department"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
								children: "Designation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
								children: "Mark"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-hairline",
					children: rows.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "transition-colors duration-150 hover:bg-surface-2",
						"data-testid": `staff-attendance-row-${entry.staff.id}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
									name: `${entry.staff.firstName} ${entry.staff.lastName}`,
									subtitle: entry.staff.employeeId,
									avatarUrl: entry.staff.avatarUrl,
									to: `/staff/${entry.staff.id}`,
									size: "sm",
									mono: true,
									testId: `staff-attendance-link-${entry.staff.id}`
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 text-sm text-muted-foreground",
								children: entry.staff.department
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 text-sm text-muted-foreground",
								children: entry.staff.designation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateToggle, {
									value: draft[entry.staff.id] ?? null,
									disabled: !canMark,
									compact: true,
									onChange: (state) => {
										setDraft((prev) => ({
											...prev,
											[entry.staff.id]: state
										}));
										setDirty(true);
									},
									testIdPrefix: `staff-state-${entry.staff.id}`
								})
							})
						]
					}, entry.staff.id))
				})]
			})
		})]
	});
}
var TOOLTIP_STYLE = {
	background: "hsl(var(--popover))",
	border: "1px solid hsl(var(--hairline))",
	borderRadius: 8,
	fontSize: 12
};
function AttendanceStats() {
	const { data: stats, isLoading } = useQuery({
		queryKey: ["attendance-stats"],
		queryFn: getAttendanceStats
	});
	const { data: trend = [], isLoading: trendLoading } = useQuery({
		queryKey: ["attendance-trend"],
		queryFn: getAttendanceTrend
	});
	if (isLoading || trendLoading || !stats) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-2",
		"data-testid": "attendance-stats-loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-12",
		"data-testid": "attendance-stats",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-7",
				eyebrow: "Trend",
				title: "Attendance rate",
				description: "Rolling school-wide rate across recent school days",
				testId: "attendance-trend-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[240px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: trend,
							margin: {
								top: 8,
								right: 4,
								bottom: 0,
								left: -18
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "attendanceStatsFill",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "hsl(var(--primary))",
										stopOpacity: .22
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "hsl(var(--primary))",
										stopOpacity: .02
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "hsl(var(--hairline))",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tickFormatter: (value) => value.slice(5),
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false,
									interval: 3
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									domain: [75, 100],
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: TOOLTIP_STYLE }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "rate",
									name: "Attendance %",
									stroke: "hsl(var(--primary))",
									strokeWidth: 1.6,
									fill: "url(#attendanceStatsFill)"
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-5",
				eyebrow: "This week",
				title: "Rate by weekday",
				description: "Where the week loses attendance",
				testId: "attendance-weekday-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[240px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: stats.weekly,
							margin: {
								top: 8,
								right: 4,
								bottom: 0,
								left: -18
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "hsl(var(--hairline))",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									domain: [70, 100],
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: TOOLTIP_STYLE }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "rate",
									name: "Attendance %",
									fill: "hsl(var(--chart-3))",
									radius: [
										3,
										3,
										0,
										0
									],
									barSize: 22
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-7",
				eyebrow: "Cohorts",
				title: "Rate by grade",
				description: "Average of every active student in the grade",
				testId: "attendance-grade-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2.5",
					children: stats.byGrade.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3",
						"data-testid": `attendance-grade-${row.grade.replace(/\s+/g, "-").toLowerCase()}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-20 shrink-0 text-sm text-foreground",
								children: row.grade
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-2 flex-1 overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("block h-full rounded-full", rateBar(row.rate)),
									style: { width: `${row.rate}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("num w-12 shrink-0 text-right text-sm font-semibold", rateTone(row.rate)),
								children: [row.rate, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num w-20 shrink-0 text-right text-xs text-muted-foreground",
								children: [row.students, " students"]
							})
						]
					}, row.grade))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-5",
				eyebrow: "Watchlist",
				title: "Chronic absence",
				description: "Students under 82% for the term",
				testId: "attendance-watchlist-panel",
				bodyClassName: "p-2",
				children: [stats.chronic.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					compact: true,
					icon: OctagonAlert,
					title: "No students at risk",
					description: "Every active student is above the 82% intervention threshold.",
					testId: "attendance-watchlist-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-hairline",
					children: stats.chronic.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 px-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
								name: `${row.student.firstName} ${row.student.lastName}`,
								subtitle: `${row.student.grade} · ${row.student.section}`,
								avatarUrl: row.student.avatarUrl,
								to: `/admin/students/${row.student.id}`,
								size: "sm",
								testId: `attendance-watchlist-${row.student.id}`
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("num shrink-0 text-sm font-semibold", rateTone(row.rate)),
							children: [row.rate, "%"]
						})]
					}, row.student.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/students?status=active",
						className: "text-xs text-primary underline-offset-2 hover:underline",
						"data-testid": "attendance-watchlist-all",
						children: "Open the student register"
					})
				})]
			})
		]
	});
}
var VIEWS = [
	{
		value: "daily",
		label: "Daily register"
	},
	{
		value: "staff",
		label: "Staff attendance"
	},
	{
		value: "stats",
		label: "Statistics"
	}
];
function AttendancePage() {
	const { can } = useAuth();
	const navigate = useNavigate();
	const searchParams = useSearch({ strict: false }) || {};
	const view = searchParams.view ?? "daily";
	const date = searchParams.date ?? todayKey();
	const classId = searchParams.class ?? "";
	const canMark = can("attendance.mark");
	const setParam = (key, value) => {
		navigate({
			search: (prev) => ({
				...prev,
				[key]: value
			}),
			replace: true
		});
	};
	const { data: overview } = useQuery({
		queryKey: ["attendance-overview", date],
		queryFn: () => getAttendanceOverview(date)
	});
	(0, import_react.useEffect)(() => {
		if (classId || !overview?.classes.length) return;
		const target = overview.classes.find((row) => !row.marked) ?? overview.classes[0];
		setParam("class", target.cls.id);
	}, [classId, overview]);
	const metrics = (0, import_react.useMemo)(() => {
		if (!overview) return [];
		return [
			{
				key: "rate",
				label: "Attendance rate",
				value: `${overview.rate}%`,
				tone: rateTone(overview.rate)
			},
			{
				key: "roster",
				label: "Active students",
				value: String(overview.total)
			},
			...ATTENDANCE_STATES.map((meta) => ({
				key: meta.value,
				label: meta.label,
				value: String(overview[meta.value]),
				tone: meta.text
			})),
			{
				key: "unmarked",
				label: "Unmarked",
				value: String(overview.unmarked)
			},
			{
				key: "registers",
				label: "Registers open",
				value: String(overview.classes.filter((row) => !row.marked).length)
			}
		];
	}, [overview]);
	const exportSummary = () => {
		if (!overview) return;
		const csv = toCsv(overview.classes.map((row) => ({
			date: overview.date,
			class: row.cls.name,
			room: row.cls.roomNo,
			students: row.total,
			submitted: row.marked ? "yes" : "no",
			present: row.present,
			absent: row.absent,
			late: row.late,
			excused: row.excused,
			rate: row.rate
		})));
		downloadTextFile(`northfield-attendance-${overview.date}.csv`, csv);
		toast.success("Attendance summary exported");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "attendance-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Operations",
				title: "Attendance",
				description: "Run the daily register class by class, mark staff, and watch the cohorts that need intervention.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-testid": "attendance-date-label",
						children: formatDate(date)
					}),
					overview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "attendance-marked-summary",
						children: [
							overview.classes.filter((row) => row.marked).length,
							"/",
							overview.classes.length,
							" registers submitted"
						]
					}),
					!canMark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Read-only for your role" })
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateField, {
					value: date,
					onChange: (next) => setParam("date", next),
					maxToday: true,
					stepper: true,
					testId: "attendance-date"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					"data-testid": "attendance-export",
					onClick: exportSummary,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8",
				"data-testid": "attendance-metrics",
				children: [metrics.map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-hairline bg-surface-1 px-3 py-2.5",
					"data-testid": `attendance-metric-${metric.key}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] font-medium text-muted-foreground",
						children: metric.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("num mt-1 font-display text-lg font-semibold leading-none", metric.tone ?? "text-foreground"),
						children: metric.value
					})]
				}, metric.key)), metrics.length === 0 && Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[62px] animate-pulse rounded-lg border border-hairline bg-surface-2" }, index))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: view,
				onValueChange: (value) => setParam("view", value),
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "h-9",
					"data-testid": "attendance-view-tabs",
					children: VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: item.value,
						"data-testid": `attendance-view-${item.value}`,
						children: item.label
					}, item.value))
				})
			}),
			view === "daily" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyRegister, {
				date,
				classId,
				canMark,
				onClassChange: (next) => setParam("class", next)
			}),
			view === "staff" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffRegister, {
				date,
				canMark
			}),
			view === "stats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttendanceStats, {})
		]
	});
}
var SplitComponent = AttendancePage;
//#endregion
export { SplitComponent as component };
