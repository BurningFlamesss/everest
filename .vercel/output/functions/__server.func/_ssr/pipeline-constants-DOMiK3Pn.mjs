import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { GraduationCap } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Separator } from "./separator-CW0Ij8xK.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { convertApplicant, createApplication, updateApplication } from "./operations-gGGfOgxw.mjs";
import { listClasses } from "./academics-BoJkVxby.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pipeline-constants-DOMiK3Pn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	applicantName: "",
	gradeApplied: "",
	gender: "female",
	dateOfBirth: "",
	email: "",
	phone: "",
	address: "",
	guardianName: "",
	guardianRelation: "Mother",
	guardianPhone: "",
	guardianEmail: "",
	previousSchool: "",
	previousGrade: "",
	entranceScore: void 0,
	source: "walk_in",
	branchId: ""
};
function ApplicationFormDialog({ open, onOpenChange, application, grades, branches, onSaved }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setError("");
		setForm(application ? {
			applicantName: application.applicantName,
			gradeApplied: application.gradeApplied,
			gender: application.gender,
			dateOfBirth: application.dateOfBirth,
			email: application.email,
			phone: application.phone,
			address: application.address,
			guardianName: application.guardian.name,
			guardianRelation: application.guardian.relation,
			guardianPhone: application.guardian.phone,
			guardianEmail: application.guardian.email,
			previousSchool: application.previousSchool,
			previousGrade: application.previousGrade,
			entranceScore: application.entranceScore,
			source: application.source,
			branchId: application.branchId
		} : {
			...EMPTY,
			gradeApplied: grades[0] ?? "",
			branchId: branches[0]?.id ?? ""
		});
	}, [open, application]);
	const set = (key, value) => setForm((prev) => ({
		...prev,
		[key]: value
	}));
	const mutation = useMutation({
		mutationFn: () => application ? updateApplication(application.id, {
			applicantName: form.applicantName,
			gradeApplied: form.gradeApplied,
			gender: form.gender,
			dateOfBirth: form.dateOfBirth,
			email: form.email,
			phone: form.phone,
			address: form.address,
			previousSchool: form.previousSchool,
			previousGrade: form.previousGrade,
			entranceScore: form.entranceScore,
			source: form.source,
			branchId: form.branchId,
			guardian: {
				...application.guardian,
				name: form.guardianName,
				relation: form.guardianRelation,
				phone: form.guardianPhone,
				email: form.guardianEmail
			}
		}, actor) : createApplication(form, actor),
		onSuccess: (saved) => {
			toast.success(application ? "Application updated" : `Application ${saved.applicationNo} recorded`);
			qc.invalidateQueries({ queryKey: ["applications"] });
			qc.invalidateQueries({ queryKey: ["application", saved.id] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			onOpenChange(false);
			onSaved?.(saved);
		},
		onError: (err) => setError(err.message)
	});
	const submit = () => {
		if (!form.applicantName.trim()) return setError("Enter the applicant's full name.");
		if (!form.gradeApplied) return setError("Choose the grade being applied for.");
		if (!form.guardianName.trim()) return setError("A guardian name is required for every application.");
		return mutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl",
			"data-testid": "application-form-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: application ? "Edit application" : "New application"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Record a walk-in or phone enquiry. New applications enter the pipeline in the “Applied” stage." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-name",
										className: "text-xs",
										children: "Applicant name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-name",
										value: form.applicantName,
										placeholder: "Amara Whitfield",
										"data-testid": "application-form-name",
										onChange: (event) => set("applicantName", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Grade applied for"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.gradeApplied,
										onValueChange: (value) => set("gradeApplied", value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "application-form-grade",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a grade" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: grades.map((grade) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: grade,
												"data-testid": `application-form-grade-${grade.replace(/\s+/g, "-").toLowerCase()}`,
												children: grade
											}, grade))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Gender"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.gender,
										onValueChange: (value) => set("gender", value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "application-form-gender",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "female",
												children: "Female"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "male",
												children: "Male"
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-dob",
										className: "text-xs",
										children: "Date of birth"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-dob",
										type: "date",
										value: form.dateOfBirth,
										"data-testid": "application-form-dob",
										onChange: (event) => set("dateOfBirth", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-email",
										className: "text-xs",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-email",
										type: "email",
										value: form.email,
										placeholder: "applicant@mail.com",
										"data-testid": "application-form-email",
										onChange: (event) => set("email", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-phone",
										className: "text-xs",
										children: "Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-phone",
										value: form.phone,
										placeholder: "+1 (555) 000-0000",
										"data-testid": "application-form-phone",
										onChange: (event) => set("phone", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-address",
										className: "text-xs",
										children: "Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-address",
										value: form.address,
										placeholder: "12 Maple Street, Northfield",
										"data-testid": "application-form-address",
										onChange: (event) => set("address", event.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label",
							children: "Guardian"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-guardian",
										className: "text-xs",
										children: "Guardian name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-guardian",
										value: form.guardianName,
										"data-testid": "application-form-guardian-name",
										onChange: (event) => set("guardianName", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Relation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.guardianRelation,
										onValueChange: (value) => set("guardianRelation", value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "application-form-guardian-relation",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Mother",
													children: "Mother"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Father",
													children: "Father"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Guardian",
													children: "Guardian"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-guardian-phone",
										className: "text-xs",
										children: "Guardian phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-guardian-phone",
										value: form.guardianPhone,
										"data-testid": "application-form-guardian-phone",
										onChange: (event) => set("guardianPhone", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-guardian-email",
										className: "text-xs",
										children: "Guardian email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-guardian-email",
										type: "email",
										value: form.guardianEmail,
										"data-testid": "application-form-guardian-email",
										onChange: (event) => set("guardianEmail", event.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label",
							children: "Background"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-prev-school",
										className: "text-xs",
										children: "Previous school"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-prev-school",
										value: form.previousSchool,
										"data-testid": "application-form-previous-school",
										onChange: (event) => set("previousSchool", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-prev-grade",
										className: "text-xs",
										children: "Previous grade"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-prev-grade",
										value: form.previousGrade,
										"data-testid": "application-form-previous-grade",
										onChange: (event) => set("previousGrade", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "app-score",
										className: "text-xs",
										children: "Entrance score (optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "app-score",
										type: "number",
										min: 0,
										max: 100,
										value: form.entranceScore ?? "",
										"data-testid": "application-form-score",
										onChange: (event) => set("entranceScore", event.target.value === "" ? void 0 : Number(event.target.value))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Source"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.source,
										onValueChange: (value) => set("source", value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "application-form-source",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "website",
													children: "Website"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "walk_in",
													children: "Walk-in"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "referral",
													children: "Referral"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "agent",
													children: "Agent"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Campus"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.branchId,
										onValueChange: (value) => set("branchId", value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "application-form-branch",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a campus" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: branches.map((branch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: branch.id,
												children: branch.name
											}, branch.id))
										})]
									})]
								})
							]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							"data-testid": "application-form-error",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "application-form-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: mutation.isPending,
					onClick: submit,
					"data-testid": "application-form-submit",
					children: mutation.isPending ? "Saving…" : application ? "Save application" : "Record application"
				})] })
			]
		})
	});
}
/** Turns an accepted applicant into an enrolled student with a class placement. */
function ConvertApplicantDialog({ application, onOpenChange }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [classId, setClassId] = (0, import_react.useState)("");
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const options = (0, import_react.useMemo)(() => {
		if (!application) return classes;
		const sameGrade = classes.filter((cls) => cls.grade === application.gradeApplied);
		return sameGrade.length ? sameGrade : classes;
	}, [classes, application]);
	(0, import_react.useEffect)(() => {
		if (!application) return;
		setClassId(options[0]?.id ?? "");
	}, [application?.id, options.length]);
	const mutation = useMutation({
		mutationFn: () => convertApplicant(application.id, classId, actor),
		onSuccess: ({ student }) => {
			toast.success(`${student.firstName} ${student.lastName} enrolled as ${student.admissionNo}`);
			qc.invalidateQueries({ queryKey: ["applications"] });
			qc.invalidateQueries({ queryKey: ["application"] });
			qc.invalidateQueries({ queryKey: ["students"] });
			qc.invalidateQueries({ queryKey: ["classes"] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			onOpenChange(false);
			navigate(`/students/${student.id}`);
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(application),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-hairline bg-popover sm:max-w-md",
			"data-testid": "convert-applicant-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }),
						" Enrol ",
						application?.applicantName
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This creates a student record with a new admission number, copies the guardian and documents across, and marks the application as enrolled." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-foreground",
							children: "Class placement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: classId,
							onValueChange: setClassId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								"data-testid": "convert-class-select",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a class" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								className: "bg-popover",
								children: options.map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: cls.id,
									"data-testid": `convert-class-${cls.id}`,
									children: [
										cls.name,
										" · ",
										cls.studentCount,
										"/",
										cls.capacity,
										" seats"
									]
								}, cls.id))
							})]
						}),
						application && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground",
							children: [
								"Applied for ",
								application.gradeApplied,
								application.entranceScore !== void 0 && ` · entrance score ${application.entranceScore}`
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "convert-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !classId || mutation.isPending,
					"data-testid": "convert-confirm",
					onClick: () => mutation.mutate(),
					children: mutation.isPending ? "Enrolling…" : "Enrol student"
				})] })
			]
		})
	});
}
/**
* The admissions pipeline, left to right. `converted` is terminal and can only
* be reached through the convert-to-student flow (it needs a class placement),
* so dropping a card there opens that dialog instead of setting the status.
*/
var PIPELINE = [
	{
		status: "pending",
		label: "Applied",
		hint: "Awaiting review",
		rail: "bg-muted-foreground",
		tint: "bg-muted-foreground/12"
	},
	{
		status: "waitlisted",
		label: "Waitlisted",
		hint: "Held for a seat",
		rail: "bg-accent",
		tint: "bg-accent/12"
	},
	{
		status: "accepted",
		label: "Offer made",
		hint: "Seat offered",
		rail: "bg-success",
		tint: "bg-success/12"
	},
	{
		status: "converted",
		label: "Enrolled",
		hint: "Now a student",
		rail: "bg-primary",
		tint: "bg-primary/12"
	},
	{
		status: "rejected",
		label: "Declined",
		hint: "Not proceeding",
		rail: "bg-destructive",
		tint: "bg-destructive/12"
	}
];
var SOURCE_LABEL = {
	website: "Website",
	walk_in: "Walk-in",
	referral: "Referral",
	agent: "Agent"
};
function scoreTone(score) {
	if (score === void 0) return "text-muted-foreground";
	if (score >= 80) return "text-success";
	if (score >= 60) return "text-warning";
	return "text-destructive";
}
//#endregion
export { ApplicationFormDialog, ConvertApplicantDialog, PIPELINE, SOURCE_LABEL, scoreTone };
