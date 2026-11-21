import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /admin/transport has been consolidated into /admin/transportation,
 * which provides comprehensive route management, vehicle specifications (Van, Bus, Custom),
 * seating capacity, estimated timings, and per-stop pricing.
 */
export const Route = createFileRoute("/admin/_admin/transport")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/transportation" });
	},
	component: () => null,
});
