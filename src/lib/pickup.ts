import { areaAliases, busRoutes, stopArea } from "../content/facilities";
import type { BusRoute, Stop } from "../content/types";

export type PickupMatch = {
	route: BusRoute;
	stop: Stop;
	areaId: string;
	score: number;
	matchedOnStop: boolean;
};

function norm(s: string): string {
	return String(s)
		.toLowerCase()
		.replace(/[\s\-_.]/g, "");
}

function levenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (!m) return n;
	if (!n) return m;
	const prev = Array.from({ length: n + 1 }, (_, i) => i);
	for (let i = 1; i <= m; i++) {
		const cur = [i];
		for (let j = 1; j <= n; j++) {
			cur[j] = Math.min(
				prev[j] + 1,
				cur[j - 1] + 1,
				prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
		}
		prev.splice(0, prev.length, ...cur);
	}
	return prev[n];
}

function tokenScore(token: string, q: string): number {
	const na = norm(token);
	if (!na) return 0;
	if (na === q) return 1;
	if (na.startsWith(q) || q.startsWith(na)) return 0.9;
	if (na.includes(q)) return 0.75;
	const d = levenshtein(na, q);
	const tol = Math.max(1, Math.floor(Math.max(na.length, q.length) * 0.25));
	return d <= tol ? 0.6 : 0;
}

/** Normalize database bus route into the frontend BusRoute shape */
export function normalizeDbRoute(r: any, index = 0): BusRoute {
	const rawStops = Array.isArray(r.stops) ? r.stops : [];
	const stops: Stop[] = rawStops.map((s: any, idx: number) => {
		if (typeof s === "string") {
			return {
				id: `stop-${r.id || index}-${idx}`,
				name: s,
				landmark: "Designated stop",
				pickup: "07:00",
				drop: "16:00",
				fare: r.feeMonthly ?? 1500,
				order: idx + 1,
			};
		}
		return {
			id: s.id || `stop-${r.id || index}-${idx}`,
			name: s.name || `Stop ${idx + 1}`,
			nameNe: s.nameNe,
			landmark: s.landmark || "Designated stop",
			pickup: s.pickupTime || s.pickup || "07:00",
			drop: s.dropoffTime || s.drop || "16:00",
			fare: typeof s.fare === "number" ? s.fare : (r.feeMonthly ?? 1500),
			order: s.order ?? idx + 1,
		};
	});

	return {
		id: r.id || `route-${index}`,
		name: r.busNumber ? `Route ${r.busNumber}` : "School Transport",
		busNo: r.busNumber || "School Bus",
		vehicleType: r.vehicleType || "Bus",
		capacity: r.capacity || 30,
		monthlyFare: r.feeMonthly ?? 1500,
		band: "under3",
		driverName: r.driverName || "Assigned Driver",
		driverPhone: r.driverPhone || "+977 71 540 000",
		path: "M 30 120 L 140 104 L 250 112 L 360 92 L 470 100 L 580 78 L 690 84",
		stops,
	};
}

/**
 * Fuzzy match over ward numbers, area names and landmarks in both English and
 * Nepali. Supports both static facilities routes and dynamic database routes.
 */
export function findPickup(query: string, customRoutes?: BusRoute[]): PickupMatch[] {
	const q = norm(query);
	if (q.length < 2) return [];
	const wardMatch = /^(?:ward)?(\d{1,2})$/.exec(q);

	const areaScores = new Map<string, number>();
	for (const a of areaAliases) {
		let best = wardMatch && a.ward === Number(wardMatch[1]) ? 1 : 0;
		for (const alias of a.aliases) best = Math.max(best, tokenScore(alias, q));
		if (best > 0) areaScores.set(a.areaId, best);
	}

	const routesToSearch =
		customRoutes && customRoutes.length > 0 ? customRoutes : busRoutes;

	const out: PickupMatch[] = [];
	for (const route of routesToSearch) {
		for (const stop of route.stops) {
			const areaId = stopArea[stop.id] ?? "";
			const own = Math.max(
				tokenScore(stop.name, q),
				tokenScore(stop.nameNe ?? "", q),
				tokenScore(stop.landmark, q),
			);
			const viaArea = (areaScores.get(areaId) ?? 0) * 0.95;
			const score = Math.max(own, viaArea);
			if (score > 0)
				out.push({ route, stop, areaId, score, matchedOnStop: own >= viaArea });
		}
	}
	return out.sort((a, b) => b.score - a.score || a.stop.order - b.stop.order);
}
