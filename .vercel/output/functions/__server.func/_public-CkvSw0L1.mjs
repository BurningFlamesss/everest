import { require_jsx_runtime } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { Outlet, useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
import { PageShell } from "./_ssr/router-B6FnglFX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_public-CkvSw0L1.js
var import_jsx_runtime = require_jsx_runtime();
/**
* The shared public layout. Every top-level public route (/, /about, /courses,
* /facilities, /gallery, /calendar, /contact) nests under this pathless route
* so the sidebar, notice ticker and footer are rendered once from here instead
* of being imported per page.
*
* The landing page uses `variant="overlay"` — its hero bleeds the full width
* and the sidebar floats on top — every other public page uses the default
* frame, which offsets the content column by the sidebar's width.
*/
function PublicLayoutRoute() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		variant: pathname === "/" ? "overlay" : "default",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { PublicLayoutRoute as component };
