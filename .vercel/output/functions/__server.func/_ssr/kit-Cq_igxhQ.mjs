import { __toESM } from "../_runtime.mjs";
import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { Content2, Header, Item, Root2, Trigger2, require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button as Button$1 } from "./button-CcyykU5Y.mjs";
import { ChevronDown } from "../_libs/lucide-react.mjs";
import { Dialog as Dialog$1, DialogContent as DialogContent$1, DialogDescription as DialogDescription$1, DialogTitle as DialogTitle$1 } from "./dialog-ST9L4J-Q.mjs";
import { Input as Input$1 } from "./input-BfuYswMi.mjs";
import { Progress as Progress$1 } from "./progress-BR51tDET.mjs";
import { Separator as Separator$1 } from "./separator-CW0Ij8xK.mjs";
import { Sheet as Sheet$1, SheetContent as SheetContent$1, SheetDescription as SheetDescription$1, SheetTitle as SheetTitle$1 } from "./tooltip-Dvg3NVEm.mjs";
import { Skeleton as Skeleton$1 } from "./skeleton-Dhh7pexn.mjs";
import { Tabs as Tabs$1, TabsContent as TabsContent$1, TabsList as TabsList$1, TabsTrigger as TabsTrigger$1 } from "./tabs-CWtZ7hop.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kit-Cq_igxhQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Accordion$1 = Root2;
var AccordionItem$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
	ref,
	className: cn("bg-transparent", "border-b border-hairline/50 bg-transparent", className),
	...props
}));
AccordionItem$1.displayName = "AccordionItem";
var AccordionTrigger$1 = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
	className: "flex",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
		ref,
		className: cn("bg-transparent", "border-0 bg-transparent shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 outline-none flex flex-1 items-center justify-between py-4 text-sm font-medium transition-colors text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger$1.displayName = Trigger2.displayName;
var AccordionContent$1 = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: "bg-transparent overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("bg-transparent", "pb-4 pt-0", className),
		children
	})
}));
AccordionContent$1.displayName = Content2.displayName;
cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
var Card$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card$1.displayName = "Card";
var CardHeader$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader$1.displayName = "CardHeader";
var CardTitle$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle$1.displayName = "CardTitle";
var CardDescription$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription$1.displayName = "CardDescription";
var CardContent$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent$1.displayName = "CardContent";
var CardFooter$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter$1.displayName = "CardFooter";
var as = (component) => component;
var Accordion = as(Accordion$1);
var AccordionItem = as(AccordionItem$1);
var AccordionTrigger = as(AccordionTrigger$1);
var AccordionContent = as(AccordionContent$1);
var Button = as(Button$1);
var Dialog = as(Dialog$1);
var DialogContent = as(DialogContent$1);
var DialogTitle = as(DialogTitle$1);
var DialogDescription = as(DialogDescription$1);
var Input = as(Input$1);
var Separator = as(Separator$1);
var Sheet = as(Sheet$1);
var SheetContent = as(SheetContent$1);
var SheetTitle = as(SheetTitle$1);
var SheetDescription = as(SheetDescription$1);
var Skeleton = as(Skeleton$1);
var Tabs = as(Tabs$1);
var TabsList = as(TabsList$1);
var TabsTrigger = as(TabsTrigger$1);
var TabsContent = as(TabsContent$1);
var Progress = as(Progress$1);
//#endregion
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input, Progress, Separator, Sheet, SheetContent, SheetDescription, SheetTitle, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger };
