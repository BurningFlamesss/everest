import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useMutation } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Separator } from "./separator-CW0Ij8xK.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { createStudent, updateStudent } from "./students-IDW3j9qD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StudentFormDialog-CcNrBXOe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	firstName: "",
	lastName: "",
	gender: "female",
	dateOfBirth: "",
	classId: "",
	branchId: "branch_main",
	email: "",
	phone: "",
	address: "",
	city: "",
	bloodGroup: "O+",
	guardianName: "",
	guardianRelation: "Father",
	guardianPhone: "",
	guardianEmail: ""
};
function StudentFormDialog({ open, onOpenChange, student, classes, branches, onSaved }) {
	const { actor } = useAuth();
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [errors, setErrors] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (student) setForm({
			firstName: student.firstName,
			lastName: student.lastName,
			gender: student.gender,
			dateOfBirth: student.dateOfBirth,
			classId: student.classId,
			branchId: student.branchId,
			email: student.email,
			phone: student.phone,
			address: student.address,
			city: student.city,
			bloodGroup: student.bloodGroup,
			guardianName: student.guardian.name,
			guardianRelation: student.guardian.relation,
			guardianPhone: student.guardian.phone,
			guardianEmail: student.guardian.email
		});
		else setForm({
			...EMPTY,
			classId: classes[0]?.id ?? ""
		});
		setErrors({});
	}, [
		open,
		student,
		classes
	]);
	const set = (key, value) => setForm((prev) => ({
		...prev,
		[key]: value
	}));
	const validate = () => {
		const next = {};
		if (!form.firstName.trim()) next.firstName = "First name is required";
		if (!form.lastName.trim()) next.lastName = "Last name is required";
		if (!form.classId) next.classId = "Choose a class";
		if (!form.guardianName.trim()) next.guardianName = "Guardian name is required";
		if (!form.guardianPhone.trim()) next.guardianPhone = "A contact number is required";
		if (form.guardianEmail && !/^\S+@\S+\.\S+$/.test(form.guardianEmail)) next.guardianEmail = "Enter a valid email";
		setErrors(next);
		return Object.keys(next).length === 0;
	};
	const mutation = useMutation({
		mutationFn: async () => {
			if (student) return updateStudent(student.id, {
				firstName: form.firstName,
				lastName: form.lastName,
				gender: form.gender,
				dateOfBirth: form.dateOfBirth,
				classId: form.classId,
				branchId: form.branchId,
				email: form.email,
				phone: form.phone,
				address: form.address,
				city: form.city,
				bloodGroup: form.bloodGroup,
				guardian: {
					...student.guardian,
					name: form.guardianName,
					relation: form.guardianRelation,
					phone: form.guardianPhone,
					email: form.guardianEmail
				}
			}, actor);
			return createStudent(form, actor);
		},
		onSuccess: (saved) => {
			toast.success(student ? `${saved.firstName} ${saved.lastName}'s record updated` : `${saved.firstName} ${saved.lastName} enrolled in ${saved.grade} · ${saved.section}`);
			onSaved?.();
			onOpenChange(false);
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92vh] overflow-y-auto bg-popover sm:max-w-2xl",
			"data-testid": "student-form-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: student ? "Edit student" : "Enroll a student"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: student ? "Update personal, academic or guardian information. Changes are written to the audit log." : "Admission numbers and roll numbers are generated automatically once the class is chosen." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label mb-2.5",
							children: "Student"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "First name",
									error: errors.firstName,
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.firstName,
										"data-testid": "student-first-name",
										onChange: (e) => set("firstName", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Last name",
									error: errors.lastName,
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.lastName,
										"data-testid": "student-last-name",
										onChange: (e) => set("lastName", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Class",
									error: errors.classId,
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.classId,
										onValueChange: (v) => set("classId", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "student-class",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a class" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: classes.map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: cls.id,
												"data-testid": `student-class-${cls.id}`,
												children: cls.name
											}, cls.id))
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Gender",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.gender,
										onValueChange: (v) => set("gender", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "student-gender",
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
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date of birth",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.dateOfBirth,
										"data-testid": "student-dob",
										onChange: (e) => set("dateOfBirth", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Campus",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.branchId,
										onValueChange: (v) => set("branchId", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "student-branch",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: branches.map((branch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: branch.value,
												children: branch.label
											}, branch.value))
										})]
									})
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label mb-2.5",
							children: "Contact"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Student email",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.email,
										placeholder: "Generated if left blank",
										"data-testid": "student-email",
										onChange: (e) => set("email", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.phone,
										"data-testid": "student-phone",
										onChange: (e) => set("phone", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Address",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.address,
										"data-testid": "student-address",
										onChange: (e) => set("address", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "City",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.city,
										"data-testid": "student-city",
										onChange: (e) => set("city", e.target.value)
									})
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label mb-2.5",
							children: "Guardian"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Guardian name",
									error: errors.guardianName,
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.guardianName,
										"data-testid": "student-guardian-name",
										onChange: (e) => set("guardianName", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Relation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.guardianRelation,
										onValueChange: (v) => set("guardianRelation", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "student-guardian-relation",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Father",
													children: "Father"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Mother",
													children: "Mother"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Guardian",
													children: "Guardian"
												})
											]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Guardian phone",
									error: errors.guardianPhone,
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.guardianPhone,
										"data-testid": "student-guardian-phone",
										onChange: (e) => set("guardianPhone", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Guardian email",
									error: errors.guardianEmail,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.guardianEmail,
										"data-testid": "student-guardian-email",
										onChange: (e) => set("guardianEmail", e.target.value)
									})
								})
							]
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "student-form-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-testid": "student-form-save",
					disabled: mutation.isPending,
					onClick: () => {
						if (validate()) mutation.mutate();
					},
					children: mutation.isPending ? "Saving…" : student ? "Save changes" : "Enroll student"
				})] })
			]
		})
	});
}
function Field({ label, error, required, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-xs",
				children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-0.5 text-destructive",
					children: "*"
				})]
			}),
			children,
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { StudentFormDialog };
