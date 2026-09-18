import { __toESM } from "../_runtime.mjs";
import { _enum, capitalizeFirstLetter, createFetch, isSafeUrlScheme, object, string$1 as string, toKebabCase } from "../_libs/@better-auth/core+[...].mjs";
import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { Slot, require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { HeadContent, Link, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, notFound, redirect, useRouteContext, useRouterState, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleAlert, Eye, EyeOff, LoaderCircle, Menu, Pause, Pencil, Pin, PinOff, Play, X } from "../_libs/lucide-react.mjs";
import { TSS_SERVER_FUNCTION, __exportAll, createMiddleware, createServerFn, getRequestHeaders, getServerFnById } from "./ssr.mjs";
import { createEnv } from "../_libs/t3-oss__env-core.mjs";
import { defu } from "../_libs/defu.mjs";
import { auth, getBaseURL } from "./auth-DrKm8FxQ.mjs";
import { prisma } from "./prisma-BJwaacZj.mjs";
import { STORE_UNMOUNT_DELAY, atom, listenKeys, onMount, onSet } from "../_libs/nanostores.mjs";
import { AnimatePresence, motion, useInView, useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { motion as motion$1 } from "../_libs/motion.mjs";
import { create, createJSONStorage, persist } from "../_libs/zustand.mjs";
import { QueryClient } from "../_libs/tanstack__query-core.mjs";
import { setupRouterSsrQueryIntegration } from "../_libs/@tanstack/react-router-ssr-query+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { ScrollTrigger, gsapWithCSS } from "../_libs/gsap.mjs";
import { Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-BUUEN0qI.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/auth-client-OlwqDO9E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var PROTO_POLLUTION_PATTERNS = {
	proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
	constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
	protoShort: /"__proto__"\s*:/,
	constructorShort: /"constructor"\s*:/
};
var JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
var SPECIAL_VALUES = {
	true: true,
	false: false,
	null: null,
	undefined: void 0,
	nan: NaN,
	infinity: Number.POSITIVE_INFINITY,
	"-infinity": Number.NEGATIVE_INFINITY
};
var ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
	return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
	const match = ISO_DATE_REGEX.exec(value);
	if (!match) return null;
	const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
	const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
	if (offsetSign) {
		const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
		date.setUTCMinutes(date.getUTCMinutes() + offset);
	}
	return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
	const { strict = false, warnings = false, reviver, parseDates = true } = options;
	if (typeof value !== "string") return value;
	const trimmed = value.trim();
	const lowerValue = trimmed.toLowerCase();
	if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
	if (!JSON_SIGNATURE.test(trimmed)) {
		if (strict) throw new SyntaxError("[better-json] Invalid JSON");
		return value;
	}
	if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
		const matches = pattern.test(trimmed);
		if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
		return matches;
	}) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
	try {
		const secureReviver = (key, value) => {
			if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
				if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
				return;
			}
			if (parseDates && typeof value === "string") {
				const date = parseISODate(value);
				if (date) return date;
			}
			return reviver ? reviver(key, value) : value;
		};
		return JSON.parse(trimmed, secureReviver);
	} catch (error) {
		if (strict) throw error;
		return value;
	}
}
function parseJSON(value, options = { strict: true }) {
	return betterJSONParse(value, options);
}
var redirectPlugin = {
	id: "redirect",
	name: "Redirect",
	hooks: { onSuccess(context) {
		if (context.data?.url && context.data?.redirect && isSafeUrlScheme(context.data.url)) {
			if (typeof window !== "undefined" && window.location) {
				if (window.location) try {
					window.location.href = context.data.url;
				} catch {}
			}
		}
	} }
};
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
/**
* Deep structural equality for JSON-serializable values.
* Handles: primitives, null, arrays, and plain objects.
* Short-circuits on referential equality at every recursion level.
*/
function isJsonEqual(a, b) {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!isJsonEqual(a[i], b[i])) return false;
		return true;
	}
	if (isPlainObject(a) && isPlainObject(b)) {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		for (const key of keysA) if (!(key in b) || !isJsonEqual(a[key], b[key])) return false;
		return true;
	}
	return false;
}
/**
* Attach an equality gate to a nanostores atom via `onSet`.
* When `isEqual(currentValue, newValue)` returns true, the `set()` call
* is aborted: no listeners fire, no framework re-renders occur.
*
* Returns the unsubscribe function from `onSet`.
*/
function withEquality(store, isEqual) {
	return onSet(store, ({ newValue, abort }) => {
		if (isEqual(store.value, newValue)) abort();
	});
}
var kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
var now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
	listeners = /* @__PURE__ */ new Set();
	name;
	constructor(name = "better-auth.message") {
		this.name = name;
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	post(message) {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(this.name, JSON.stringify({
				...message,
				timestamp: now$1()
			}));
		} catch {}
	}
	setup() {
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const handler = (event) => {
			if (event.key !== this.name) return;
			const message = JSON.parse(event.newValue ?? "{}");
			if (message?.event !== "session" || !message?.data) return;
			this.listeners.forEach((listener) => listener(message));
		};
		window.addEventListener("storage", handler);
		return () => {
			window.removeEventListener("storage", handler);
		};
	}
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
	if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
	return globalThis[kBroadcastChannel];
}
var kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
	listeners = /* @__PURE__ */ new Set();
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	setFocused(focused) {
		this.listeners.forEach((listener) => listener(focused));
	}
	setup() {
		if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const visibilityHandler = () => {
			if (document.visibilityState === "visible") this.setFocused(true);
		};
		document.addEventListener("visibilitychange", visibilityHandler, false);
		return () => {
			document.removeEventListener("visibilitychange", visibilityHandler, false);
		};
	}
};
function getGlobalFocusManager() {
	if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
	return globalThis[kFocusManager];
}
var kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
	listeners = /* @__PURE__ */ new Set();
	isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	setOnline(online) {
		this.isOnline = online;
		this.listeners.forEach((listener) => listener(online));
	}
	setup() {
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const onOnline = () => this.setOnline(true);
		const onOffline = () => this.setOnline(false);
		window.addEventListener("online", onOnline, false);
		window.addEventListener("offline", onOffline, false);
		return () => {
			window.removeEventListener("online", onOnline, false);
			window.removeEventListener("offline", onOffline, false);
		};
	}
};
function getGlobalOnlineManager() {
	if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
	return globalThis[kOnlineManager];
}
var now = () => Math.floor(Date.now() / 1e3);
/**
* Rate limit: don't refetch on focus if a session request was made within this many seconds
*/
var FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
	const { fetchSession, shouldPollSession = () => true, sessionSignal, options = {} } = opts;
	const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
	const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
	const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
	const state = {
		isInitialized: false,
		lastSessionRequest: 0
	};
	const shouldRefetch = () => {
		return refetchWhenOffline || getGlobalOnlineManager().isOnline;
	};
	const triggerRefetch = (event) => {
		if (!shouldRefetch()) return;
		if (event?.event === "storage") {
			fetchSession();
			return;
		}
		if (event?.event === "poll") {
			state.lastSessionRequest = now();
			fetchSession();
			return;
		}
		if (event?.event === "visibilitychange") {
			if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
			state.lastSessionRequest = now();
			fetchSession();
			return;
		}
		fetchSession();
	};
	const broadcastSessionUpdate = (trigger) => {
		getGlobalBroadcastChannel().post({
			event: "session",
			data: { trigger },
			clientId: Math.random().toString(36).substring(7)
		});
	};
	const setupPolling = () => {
		if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
			if (shouldPollSession()) triggerRefetch({ event: "poll" });
		}, refetchInterval * 1e3);
	};
	const setupBroadcast = () => {
		state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
			triggerRefetch({ event: "storage" });
		});
	};
	const setupFocusRefetch = () => {
		if (!refetchOnWindowFocus) return;
		state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
			triggerRefetch({ event: "visibilitychange" });
		});
	};
	const setupOnlineRefetch = () => {
		state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
			if (online) triggerRefetch({ event: "visibilitychange" });
		});
	};
	const setupSignalSubscription = () => {
		state.unsubscribeSignal = sessionSignal.listen(() => {
			fetchSession();
		});
	};
	const init = () => {
		if (state.isInitialized) return;
		state.isInitialized = true;
		setupPolling();
		setupBroadcast();
		setupFocusRefetch();
		setupOnlineRefetch();
		setupSignalSubscription();
		state.cleanupBroadcastSetup = getGlobalBroadcastChannel().setup();
		state.cleanupFocusSetup = getGlobalFocusManager().setup();
		state.cleanupOnlineSetup = getGlobalOnlineManager().setup();
	};
	const cleanup = () => {
		if (!state.isInitialized) return;
		if (state.pollInterval) {
			clearInterval(state.pollInterval);
			state.pollInterval = void 0;
		}
		if (state.unsubscribeBroadcast) {
			state.unsubscribeBroadcast();
			state.unsubscribeBroadcast = void 0;
		}
		if (state.unsubscribeFocus) {
			state.unsubscribeFocus();
			state.unsubscribeFocus = void 0;
		}
		if (state.unsubscribeOnline) {
			state.unsubscribeOnline();
			state.unsubscribeOnline = void 0;
		}
		if (state.unsubscribeSignal) {
			state.unsubscribeSignal();
			state.unsubscribeSignal = void 0;
		}
		if (state.cleanupBroadcastSetup) {
			state.cleanupBroadcastSetup();
			state.cleanupBroadcastSetup = void 0;
		}
		if (state.cleanupFocusSetup) {
			state.cleanupFocusSetup();
			state.cleanupFocusSetup = void 0;
		}
		if (state.cleanupOnlineSetup) {
			state.cleanupOnlineSetup();
			state.cleanupOnlineSetup = void 0;
		}
		state.isInitialized = false;
		state.lastSessionRequest = 0;
	};
	return {
		init,
		cleanup,
		triggerRefetch,
		broadcastSessionUpdate
	};
}
var isServer = () => typeof window === "undefined";
var SESSION_MOUNT_DEDUPE_INTERVAL = STORE_UNMOUNT_DELAY;
function hydrateSessionAtom(sessionAtom, session) {
	if (typeof window === "undefined") return;
	const currentSession = sessionAtom.get();
	if (currentSession.data !== null || session === null) return;
	sessionAtom.set({
		...currentSession,
		data: session,
		error: null,
		isPending: false
	});
}
/**
* Normalize $fetch response: `throw: true` returns data directly,
* otherwise `{ data, error }`.
*/
function normalizeSessionResponse(res) {
	if (typeof res === "object" && res !== null && "data" in res && "error" in res) return res;
	return {
		data: res,
		error: null
	};
}
function normalizeSessionData(data) {
	if (!data) return null;
	if (data.session === null && data.user === null) return null;
	return data;
}
function isSessionAtomEqual(a, b) {
	return isJsonEqual(a.data, b.data) && a.error === b.error && a.isPending === b.isPending && a.isRefetching === b.isRefetching && a.refetch === b.refetch;
}
function getSessionAtom($fetch, options) {
	const $signal = /* @__PURE__ */ atom(false);
	let flight;
	let freshUntil = 0;
	let sessionRevision = 0;
	$signal.listen(() => {
		sessionRevision++;
		freshUntil = 0;
	});
	const refetch = (queryParams) => fetchSession(queryParams);
	const session = /* @__PURE__ */ atom({
		data: null,
		error: null,
		isPending: true,
		isRefetching: false,
		refetch
	});
	withEquality(session, isSessionAtomEqual);
	const executeSessionFetch = async (signal, queryParams) => {
		const current = session.value;
		session.set({
			...current,
			isPending: current.data === null,
			isRefetching: true,
			error: null,
			refetch
		});
		if (signal.aborted) return "aborted";
		try {
			const res = await $fetch("/get-session", {
				method: "GET",
				query: queryParams?.query,
				signal
			});
			if (signal.aborted) return "aborted";
			let { data, error } = normalizeSessionResponse(res);
			let outcome = "fresh";
			if (data?.needsRefresh) try {
				const refreshRes = await $fetch("/get-session", {
					method: "POST",
					signal
				});
				if (signal.aborted) return "aborted";
				({data, error} = normalizeSessionResponse(refreshRes));
			} catch {
				if (signal.aborted) return "aborted";
				outcome = "stale";
			}
			if (error) {
				const latest = session.value;
				const isUnauthorized = error?.status === 401;
				session.set({
					data: isUnauthorized ? null : latest.data,
					error,
					isPending: false,
					isRefetching: false,
					refetch
				});
				return "failed";
			}
			const sessionData = normalizeSessionData(data);
			const current = session.value;
			const stableData = current.data != null && sessionData != null && isJsonEqual(current.data, sessionData) ? current.data : sessionData;
			session.set({
				data: stableData,
				error: null,
				isPending: false,
				isRefetching: false,
				refetch
			});
			return outcome;
		} catch (fetchError) {
			if (signal.aborted) return "aborted";
			const latest = session.value;
			session.set({
				data: latest.data,
				error: fetchError,
				isPending: false,
				isRefetching: false,
				refetch
			});
			return "failed";
		}
	};
	const getFreshUntil = () => {
		const expiresAt = session.value.data?.session?.expiresAt;
		const sessionExpiresAt = expiresAt instanceof Date ? expiresAt.getTime() : Number.POSITIVE_INFINITY;
		return Math.min(Date.now() + SESSION_MOUNT_DEDUPE_INTERVAL, sessionExpiresAt);
	};
	const fetchSession = (queryParams) => {
		freshUntil = 0;
		flight?.cancel();
		const controller = new AbortController();
		const request = {
			cancel: () => controller.abort(),
			promise: Promise.resolve().then(() => {
				if (controller.signal.aborted) return "aborted";
				return executeSessionFetch(controller.signal, queryParams);
			}),
			revision: sessionRevision
		};
		flight = request;
		const settleFlight = (outcome) => {
			if (flight !== request) return;
			flight = void 0;
			if (outcome === "fresh" && request.revision === sessionRevision) freshUntil = getFreshUntil();
		};
		request.promise.then(settleFlight, () => settleFlight("failed"));
		return request.promise.then(() => void 0);
	};
	const fetchSessionOnMount = () => {
		if (flight?.revision === sessionRevision) return flight.promise.then(() => void 0);
		if (Date.now() < freshUntil) return Promise.resolve();
		return fetchSession();
	};
	let broadcastSessionUpdate = () => {};
	onMount(session, () => {
		let timeoutId;
		if (!isServer()) timeoutId = setTimeout(() => {
			fetchSessionOnMount();
		}, 0);
		const refreshManager = createSessionRefreshManager({
			fetchSession,
			shouldPollSession: () => session.value.data != null,
			sessionSignal: $signal,
			options
		});
		refreshManager.init();
		broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			refreshManager.cleanup();
		};
	});
	return {
		session,
		$sessionSignal: $signal,
		broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
	};
}
var resolvePublicAuthUrl = (basePath) => {
	if (typeof process === "undefined") return void 0;
	const path = basePath ?? "/api/auth";
	if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
	if (typeof window === "undefined") {
		if (process.env.NEXTAUTH_URL) try {
			return process.env.NEXTAUTH_URL;
		} catch {}
		if (process.env.VERCEL_URL) try {
			const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
			return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
		} catch {}
	}
};
var getClientConfig = (options, loadEnv) => {
	const isCredentialsSupported = "credentials" in Request.prototype;
	const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0, loadEnv) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
	const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
	const lifeCyclePlugin = {
		id: "lifecycle-hooks",
		name: "lifecycle-hooks",
		hooks: {
			onSuccess: options?.fetchOptions?.onSuccess,
			onError: options?.fetchOptions?.onError,
			onRequest: options?.fetchOptions?.onRequest,
			onResponse: options?.fetchOptions?.onResponse
		}
	};
	const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
	const $fetch = createFetch({
		baseURL,
		...isCredentialsSupported ? { credentials: "include" } : {},
		method: "GET",
		jsonParser(text) {
			if (!text) return null;
			return parseJSON(text, { strict: false });
		},
		customFetchImpl: fetch,
		...restOfFetchOptions,
		plugins: [
			lifeCyclePlugin,
			...restOfFetchOptions.plugins || [],
			...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
			...pluginsFetchPlugins
		]
	});
	const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
	let hasHydrated = false;
	const hydrateSession = (sessionData) => {
		if (hasHydrated || sessionData === null) return;
		hasHydrated = true;
		hydrateSessionAtom(session, sessionData);
	};
	const plugins = options?.plugins || [];
	let pluginsActions = {};
	const pluginsAtoms = {
		$sessionSignal,
		session
	};
	const pluginPathMethods = {
		"/sign-out": "POST",
		"/revoke-sessions": "POST",
		"/revoke-other-sessions": "POST",
		"/delete-user": "POST"
	};
	const atomListeners = [{
		signal: "$sessionSignal",
		matcher(path) {
			return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/revoke-other-sessions" || path === "/change-email" || path === "/change-password";
		},
		callback(path) {
			if (path === "/sign-out") broadcastSessionUpdate("signout");
			else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
		}
	}];
	for (const plugin of plugins) {
		if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
		if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
		if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
	}
	const $store = {
		notify: (signal) => {
			pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
		},
		listen: (signal, listener) => {
			pluginsAtoms[signal].subscribe(listener);
		},
		atoms: pluginsAtoms
	};
	for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
	return {
		get baseURL() {
			return baseURL;
		},
		pluginsActions,
		pluginsAtoms,
		pluginPathMethods,
		atomListeners,
		hydrateSession,
		$sessionSignal,
		$fetch,
		$store
	};
};
function isAtom(value) {
	return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
	const method = knownPathMethods[path];
	const { fetchOptions, query: _query, ...body } = args || {};
	if (method) return method;
	if (fetchOptions?.method) return fetchOptions.method;
	if (body && Object.keys(body).length > 0) return "POST";
	return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
	function createProxy(path = []) {
		return new Proxy(function() {}, {
			get(_, prop) {
				if (typeof prop !== "string") return;
				if (prop === "then" || prop === "catch" || prop === "finally") return;
				const fullPath = [...path, prop];
				let current = routes;
				for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
				else {
					current = void 0;
					break;
				}
				if (typeof current === "function") return current;
				if (isAtom(current)) return current;
				return createProxy(fullPath);
			},
			apply: async (_, __, args) => {
				const routePath = "/" + path.map(toKebabCase).join("/");
				const arg = args[0] || {};
				const fetchOptions = args[1] || {};
				const { query, fetchOptions: argFetchOptions, ...body } = arg;
				const options = {
					...fetchOptions,
					...argFetchOptions
				};
				const method = getMethod(routePath, knownPathMethods, arg);
				return await client(routePath, {
					...options,
					body: method === "GET" ? void 0 : {
						...body,
						...options?.body || {}
					},
					query: query || options?.query,
					method,
					async onSuccess(context) {
						await options?.onSuccess?.(context);
						if (!atomListeners || options.disableSignal) return;
						/**
						* We trigger listeners
						*/
						const matches = atomListeners.filter((s) => s.matcher(routePath));
						if (!matches.length) return;
						const visited = /* @__PURE__ */ new Set();
						for (const match of matches) {
							const signal = atoms[match.signal];
							if (!signal) return;
							if (visited.has(match.signal)) continue;
							visited.add(match.signal);
							/**
							* To avoid race conditions we set the signal in a setTimeout
							*/
							const val = signal.get();
							setTimeout(() => {
								signal.set(!val);
							}, 10);
							match.callback?.(routePath);
						}
					}
				});
			}
		});
	}
	return createProxy();
}
/**
* Subscribe to store changes and get store's value.
*
* Can be used with store builder too.
*
* ```js
* import { useStore } from 'nanostores/react'
*
* import { router } from '../store/router'
*
* export const Layout = () => {
*   let page = useStore(router)
*   if (page.route === 'home') {
*     return <HomePage />
*   } else {
*     return <Error404 />
*   }
* }
* ```
*
* @param store Store instance.
* @returns Store value.
*/
function useStore(store, options = {}) {
	const snapshotRef = (0, import_react.useRef)(store.get());
	const { keys, deps = [store, keys] } = options;
	const subscribe = (0, import_react.useCallback)((onChange) => {
		const emitChange = (value) => {
			if (snapshotRef.current === value) return;
			snapshotRef.current = value;
			onChange();
		};
		emitChange(store.value);
		if (keys?.length) return listenKeys(store, keys, emitChange);
		return store.listen(emitChange);
	}, deps);
	const get = () => snapshotRef.current;
	return (0, import_react.useSyncExternalStore)(subscribe, get, get);
}
function getAtomKey(str) {
	return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
	const { pluginPathMethods, pluginsActions, pluginsAtoms, hydrateSession, $fetch, $store, atomListeners } = getClientConfig(options);
	const resolvedHooks = {};
	for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
	return createDynamicPathProxy({
		...pluginsActions,
		...resolvedHooks,
		hydrateSession,
		$fetch,
		$store
	}, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
var authClient = createAuthClient({ baseURL: createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_APP_TITLE: string().min(1).optional(),
		VITE_APP_URL: string()
	},
	runtimeEnv: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_APP_URL": "http://localhost:3000"
	},
	emptyStringAsUndefined: true,
	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) => console.error(`  ${issue.path?.join(".")}: ${issue.message}`));
		process.exit(1);
	}
}).VITE_APP_URL });
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/permissions-D_OUE9Yt.js
var STAFF_PERMISSIONS = [
	"overview.view",
	"students.view",
	"staff.view",
	"classes.view",
	"courses.view",
	"attendance.view",
	"attendance.mark",
	"notices.view",
	"notices.manage",
	"events.view",
	"gallery.view",
	"gallery.manage"
];
var ADMIN_PERMISSIONS = [
	...STAFF_PERMISSIONS,
	"students.manage",
	"staff.manage",
	"users.view",
	"classes.manage",
	"courses.manage",
	"notices.publish",
	"events.manage",
	"admissions.view",
	"admissions.manage",
	"transport.view",
	"transport.manage",
	"payments.view",
	"payments.manage",
	"website.view",
	"website.manage",
	"activity.view",
	"settings.view"
];
var ROLE_PERMISSIONS = {
	super_admin: [
		...ADMIN_PERMISSIONS,
		"users.manage",
		"settings.manage"
	],
	admin: ADMIN_PERMISSIONS,
	staff: STAFF_PERMISSIONS,
	student: [
		"overview.view",
		"notices.view",
		"events.view",
		"gallery.view"
	],
	guardian: [
		"overview.view",
		"notices.view",
		"events.view",
		"gallery.view",
		"payments.view"
	]
};
var ROLE_LABEL = {
	super_admin: "Super Admin",
	admin: "Admin",
	staff: "Staff",
	student: "Student",
	guardian: "Guardian"
};
var ROLE_DESCRIPTION = {
	super_admin: "Unrestricted access including roles, permissions and organization settings.",
	admin: "Runs day-to-day school operations: people, admissions, finance and website.",
	staff: "Teaching and support staff. Marks attendance and drafts communications.",
	student: "Portal access to notices, events and personal academic records.",
	guardian: "Portal access to their children's records, fees and school communications."
};
function can(role, permission) {
	return ROLE_PERMISSIONS[role && ROLE_PERMISSIONS[role] ? role : "super_admin"].includes(permission);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/AuthProvider-DqbSnXwU.js
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_ACTOR = {
	id: "anonymous",
	name: "System",
	role: "staff"
};
var AuthContext = (0, import_react.createContext)(void 0);
function AuthProvider({ children }) {
	const { data, isPending } = authClient.useSession();
	const context = useRouteContext({ strict: false });
	const sessionUser = data?.user || context?.session?.user;
	const user = sessionUser ? {
		id: sessionUser.id,
		name: sessionUser.name || (sessionUser.email ? sessionUser.email.split("@")[0].replace(/[._-]/g, " ") : "Admin"),
		email: sessionUser.email,
		role: sessionUser.role || "super_admin",
		avatarUrl: sessionUser.image || (sessionUser.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sessionUser.email)}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"),
		title: sessionUser.title || "Administrator"
	} : null;
	const signOut = (0, import_react.useCallback)(async () => {
		document.cookie = "scms_demo_session=; path=/; max-age=0;";
		try {
			await authClient.signOut();
			window.location.href = "/login";
		} catch {
			window.location.href = "/login";
		}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		actor: user ? {
			id: user.id,
			name: user.name,
			role: user.role
		} : FALLBACK_ACTOR,
		loading: isPending,
		signOut,
		can: (permission) => can(user?.role, permission)
	}), [
		user,
		signOut,
		isPending
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
	return ctx;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/__root-DXLfIp1f.js
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "not-found",
		"data-testid": "not-found-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "404 / OFF THE MAP" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
				"This chapter",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				"is not here."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The page may have moved, or the address may be incomplete." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "institution-button activation-link",
				"data-testid": "not-found-home-link",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": "true" }), " Return home"]
			})
		]
	});
}
var getSessionMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
	const { getRequestHeaders } = await import("./ssr.mjs").then((n) => n.ssr_exports).then((n) => n.server_exports);
	const headers = getRequestHeaders();
	let session = null;
	try {
		const { auth } = await import("./auth-DrKm8FxQ.mjs").then((n) => n.auth_exports);
		session = await auth.api.getSession({ headers });
	} catch {
		session = null;
	}
	if (!session) {
		const match = (headers.get("cookie") || "").match(/scms_demo_session=([^;]+)/);
		if (match) try {
			const decoded = JSON.parse(decodeURIComponent(match[1]));
			if (decoded && decoded.user) session = {
				user: decoded.user,
				session: {
					id: "demo-session-id",
					userId: decoded.user.id,
					expiresAt: new Date(Date.now() + 864e5).toISOString()
				}
			};
		} catch {
			session = null;
		}
	}
	return await next({ context: { session } });
});
var getSessionFn = createServerFn().middleware([getSessionMiddleware]).handler(createSsrRpc("5a8af6680063df0c7f974c51333c10362bdfc0fa2fb194e30206b917b36b4413"));
var PageKeySchema = object({ key: _enum([
	"homepage",
	"about",
	"contact",
	"other",
	"faculty",
	"login"
]) });
var StringSchema = object({ identifier: string() });
/** Published page for a managed key (public rendering). */
var getWebsitePageServer = createServerFn({ method: "GET" }).validator(PageKeySchema).handler(createSsrRpc("24972fe8e2a57b4119cb627621a200ef9021b91d16e694c2c9f298757cb5591e"));
/**
* Any-status page for a managed key, used by the admin live preview
* (`?cms=1`), so drafts render WYSIWYG before being published. Not cached.
*/
var getWebsitePagePreviewServer = createServerFn({ method: "GET" }).validator(PageKeySchema).handler(createSsrRpc("05ee4134c252859a7c7ddbd9eda0df4da21ee5b4602332a49c5dbd0bfcc10ee5"));
var getSchoolConfigServer = createServerFn({ method: "GET" }).validator(StringSchema).handler(createSsrRpc("15fe0817f69751555a6a34b4afc70d42ace904896970693c7e3f9e17b9abf47c"));
var getSchoolContentServer = createServerFn({ method: "GET" }).validator(StringSchema).handler(createSsrRpc("d78fec660a8c9f262f3e0a9e4248f673f8878e00ed4199c753315e701e054dcf"));
createServerFn({ method: "GET" }).handler(createSsrRpc("b7f43ea08a9023819e12e9f7bfe7d553765bc7900caa1eec1bf61db1cfe94ae2"));
/** Public faculty directory, sorted leadership-first by rank. */
var getFacultyMembersServer = createServerFn({ method: "GET" }).handler(createSsrRpc("0a2a59ee9783d075f29b433934622b87c0f0b7a421b8e27ca86bfe9a25786d43"));
/** Public notice board, pinned first then newest date first. */
var getNoticesServer = createServerFn({ method: "GET" }).handler(createSsrRpc("359cf7121f28a135211f559ff82c48270e5ff3f06c6b0ab8ca693494ff4ccf29"));
/** Public scholarship schemes in their editorial (seed) order. */
var getScholarshipsServer = createServerFn({ method: "GET" }).handler(createSsrRpc("c7258a65f851fdb91e10c600c93080da12e341370b1597d54bbadeb6d2331a64"));
createServerFn({ method: "GET" }).handler(createSsrRpc("fa328c642cc834688b17faf9c0dd85e5b23dc6b8639d6895b70c42c68bf6bc58"));
createServerFn({ method: "GET" }).handler(createSsrRpc("80425186da58ad0aa712b7e791da23b3e3150f46dc1934737d9e7224fbf2bd28"));
var getResourcesServer = createServerFn({ method: "GET" }).handler(createSsrRpc("bee60ab55065ac11a205d11b69d5d2fec2f00ad36719a3d1f5cef19aa920f5aa"));
var getBoardResultsServer = createServerFn({ method: "GET" }).handler(createSsrRpc("359054cc702b9ee1cb0cc381a97ddadb1798fcd4636f7ed76037fa0022577d6a"));
var getBusRoutesServer = createServerFn({ method: "GET" }).handler(createSsrRpc("fb307d82a368b0935b1167e49a44c136f1527fe896ba1a1ad925fb4dfffe55bd"));
createServerFn({ method: "GET" }).handler(createSsrRpc("e0d85bd2c89db392d868fa4fe13b34ffd12562d1f60f8dfa16b2e132f7c0be0e"));
var CACHE_DURATION = 6e5;
var useContentStore = create()(persist((set, get) => ({
	schoolConfig: null,
	schoolContent: null,
	websitePages: /* @__PURE__ */ new Map(),
	lastFetched: /* @__PURE__ */ new Map(),
	isLoading: false,
	error: null,
	setSchoolConfig: (config) => set({ schoolConfig: config }),
	setSchoolContent: (content) => set({ schoolContent: content }),
	setWebsitePage: (key, page) => set((state) => {
		const newPages = new Map(state.websitePages);
		const newLastFetched = new Map(state.lastFetched);
		newPages.set(key, page);
		newLastFetched.set(key, Date.now());
		return {
			websitePages: newPages,
			lastFetched: newLastFetched
		};
	}),
	getWebsitePage: (key) => get().websitePages.get(key),
	hasValidCache: (key, maxAge = CACHE_DURATION) => {
		const lastFetched = get().lastFetched.get(key);
		return lastFetched !== void 0 && Date.now() - lastFetched < maxAge;
	},
	setLoading: (loading) => set({ isLoading: loading }),
	setError: (error) => set({ error }),
	clearCache: () => set({
		websitePages: /* @__PURE__ */ new Map(),
		lastFetched: /* @__PURE__ */ new Map(),
		schoolConfig: null,
		schoolContent: null
	})
}), {
	name: "scms-content-store",
	storage: createJSONStorage(() => localStorage),
	partialize: (state) => ({
		schoolConfig: state.schoolConfig,
		schoolContent: state.schoolContent,
		websitePages: Array.from(state.websitePages.entries()),
		lastFetched: Array.from(state.lastFetched.entries())
	}),
	onRehydrateStorage: () => (state) => {
		if (state) {
			state.websitePages = new Map(state.websitePages);
			state.lastFetched = new Map(state.lastFetched);
		}
	}
}));
var useSchoolConfig$1 = () => useContentStore((state) => state.schoolConfig);
var useSchoolContent$1 = () => useContentStore((state) => state.schoolContent);
function useSchoolConfig() {
	const storeConfig = useSchoolConfig$1();
	const loaderConfig = Route$60.useLoaderData({ select: (data) => data.config });
	return storeConfig ?? loaderConfig;
}
function useSchoolContent() {
	const storeContent = useSchoolContent$1();
	const loaderContent = Route$60.useLoaderData({ select: (data) => data.content });
	return { sidebar: storeContent?.sidebar ?? loaderContent?.sidebar };
}
/**
* Returns the published WebsitePage for a managed page key (with its rendered
* blocks) when one exists, so public routes can be driven from the admin CMS.
* Falls back to null so pages keep their static design until content is
* published.
*/
function useWebsitePageContent(key) {
	const loaderContent = Route$60.useLoaderData({ select: (data) => data.content[key] });
	if (loaderContent && loaderContent.status === "published" && Array.isArray(loaderContent.blocks) && loaderContent.blocks.length > 0) return loaderContent;
	return null;
}
/**
* Public faculty directory loaded from the database by the root loader.
* Null when the collection has not been seeded, so pages fall back to their
* static data.
*/
function useFacultyDirectory() {
	return Route$60.useLoaderData({ select: (data) => data.content.facultyMembers }) ?? null;
}
/** Public notice board loaded from the database. */
function useNotices() {
	return Route$60.useLoaderData({ select: (data) => data.content.notices }) ?? null;
}
/** Public scholarship schemes loaded from the database. */
function useScholarships() {
	return Route$60.useLoaderData({ select: (data) => data.content.scholarships }) ?? null;
}
var SIDEBAR_W = 240;
function setNavWidth(open) {
	document.documentElement.style.setProperty("--nav-w", open ? `${SIDEBAR_W}px` : "0px");
}
function SidebarItem({ item, pathname }) {
	const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
	const [isOpen, setIsOpen] = (0, import_react.useState)(isActive);
	const hasChildren = item.children && item.children.length > 0;
	(0, import_react.useEffect)(() => {
		if (hasChildren && item.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + "/")))) setIsOpen(true);
	}, [
		pathname,
		hasChildren,
		item.children
	]);
	if (!hasChildren) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: item.href ?? "/",
		target: item.external ? "_blank" : void 0,
		className: cn("flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium transition-colors hover:text-[#EAB308]", isActive ? "text-[#EAB308]" : "text-white"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center w-full transition-colors",
		children: [item.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: item.href,
			className: cn("flex-1 px-4 py-2 text-sm font-medium text-left transition-colors hover:text-[#EAB308]", isActive ? "text-[#EAB308]" : "text-white"),
			children: item.label
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setIsOpen((s) => !s),
			className: cn("flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-left transition-colors bg-transparent border-none hover:text-[#EAB308]", isActive ? "text-[#EAB308]" : "text-white"),
			children: item.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setIsOpen((s) => !s),
			"aria-expanded": isOpen,
			className: "cursor-pointer px-3 py-2 text-white bg-transparent border-none hover:text-[#EAB308] transition-colors",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
				size: 16,
				className: cn("shrink-0 transition-transform duration-300", isOpen ? "rotate-90" : "")
			})
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
		initial: false,
		children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.ul, {
			initial: {
				height: 0,
				opacity: 0
			},
			animate: {
				height: "auto",
				opacity: 1
			},
			exit: {
				height: 0,
				opacity: 0
			},
			transition: { duration: .2 },
			className: "overflow-hidden ml-6 pl-2 border-l border-white/20 mt-1 space-y-1 flex flex-col",
			children: item.children?.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem, {
				item: child,
				pathname
			}, child.id))
		})
	})] });
}
function Sidebar() {
	const { data } = authClient.useSession();
	const { sidebar } = useSchoolContent();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const reduced = useReducedMotion();
	const isAdmin = pathname.startsWith("/admin");
	const [isOpen, setIsOpen] = (0, import_react.useState)(() => pathname === "/");
	const [pinned, setPinned] = (0, import_react.useState)(false);
	const [sheetOpen, setSheetOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (pinned || pathname !== "/") return;
		const onScroll = () => setIsOpen(window.scrollY <= 50);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [pinned, pathname]);
	(0, import_react.useEffect)(() => {
		if (pathname === "/") setIsOpen(true);
	}, [pathname]);
	(0, import_react.useEffect)(() => setNavWidth(isOpen), [isOpen]);
	(0, import_react.useEffect)(() => {
		if (!sheetOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") setSheetOpen(false);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [sheetOpen]);
	if (isAdmin) return null;
	const logoMark = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/public/schools/everest/logo.png",
		alt: "School logo",
		className: "h-16 object-contain"
	});
	const navFooter = data?.session?.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "bg-[#EAB308] flex w-full items-center justify-center py-2 cursor-pointer text-black hover:bg-[#EAB308]/90",
		children: "Login"
	});
	const navLinks = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 mt-4",
		children: sidebar?.collapsible && Object.values(sidebar.collapsible).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem, {
			item,
			pathname
		}, item.id))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: cn("fixed top-0 left-0 z-nav hidden h-screen w-60 flex-col justify-between bg-primary rounded-br-2xl shadow-xl transition-transform duration-500 lg:flex", isOpen ? "translate-x-0" : "-translate-x-full"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "flex flex-col items-center justify-center text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex items-center gap-3 p-4",
						"data-testid": "nav-home",
						children: logoMark
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Main",
					className: "min-h-0 flex-1 overflow-auto text-primary-foreground",
					children: navLinks
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "bg-primary",
					children: navFooter
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed top-4 right-4 z-nav hidden flex-col items-center gap-2 rounded-full bg-primary/95 backdrop-blur-sm p-1.5 shadow-lg lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setIsOpen((s) => !s),
				"aria-expanded": isOpen,
				"aria-label": isOpen ? "Close navigation" : "Open navigation",
				title: isOpen ? "Close navigation" : "Open navigation",
				"data-testid": "nav-collapse-toggle",
				className: "inline-flex size-9 border-none cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
					"aria-hidden": "true",
					size: 18
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPinned((s) => !s),
				"aria-pressed": pinned,
				"aria-label": pinned ? "Unlock sidebar" : "Lock sidebar open",
				title: pinned ? "Auto-collapse: OFF" : "Lock open",
				"data-testid": "nav-pin-toggle",
				className: cn("inline-flex size-9 border-none cursor-pointer items-center justify-center rounded-full transition-colors", pinned ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/30"),
				children: pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
					"aria-hidden": "true",
					size: 16
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, {
					"aria-hidden": "true",
					size: 16
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-x-0 top-0 z-nav flex h-topbar items-center justify-between bg-primary px-4 lg:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "flex min-w-0 items-center gap-3",
				"data-testid": "nav-home-mobile",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/public/schools/everest/logo.png",
					alt: "School logo",
					className: "h-8 object-contain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-[15px] font-semibold text-primary-foreground",
					children: sidebar?.tagline
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setSheetOpen(true),
				"aria-expanded": sheetOpen,
				"aria-controls": "sidebar-nav-panel",
				"data-testid": "nav-mobile-trigger",
				className: "inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
					"aria-hidden": "true",
					size: 20
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Open the main menu"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: sheetOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.div, {
			className: "fixed inset-0 z-overlay lg:hidden",
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			transition: { duration: .2 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				tabIndex: -1,
				"aria-label": "Close the main menu",
				"data-testid": "nav-mobile-scrim",
				className: "absolute inset-0 border-none bg-black/60",
				onClick: () => setSheetOpen(false)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.nav, {
				"aria-label": "Main",
				id: "sidebar-nav-panel",
				"data-testid": "nav-mobile-sheet",
				className: "absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-3xl bg-primary",
				initial: reduced ? { opacity: 0 } : { y: "100%" },
				animate: reduced ? { opacity: 1 } : { y: 0 },
				exit: reduced ? { opacity: 0 } : { y: "100%" },
				transition: { duration: .3 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/public/schools/everest/logo.png",
							alt: "School logo",
							className: "h-16 w-full object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSheetOpen(false),
							"data-testid": "nav-mobile-close",
							className: "absolute right-4 top-4 inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								"aria-hidden": "true",
								size: 20
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Close the main menu"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto px-4 py-4 text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							"aria-label": "Main",
							children: navLinks
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { paddingBottom: "env(safe-area-inset-bottom)" },
						className: "px-4",
						children: navFooter
					})
				]
			})]
		}) })
	] });
}
var theme_default = "/assets/theme-D062jX46.css";
var app_default = "/assets/app-DZbLoNb7.css";
var src_default = "/assets/index-DLgRBgrO.css";
var styles_default = "/assets/styles-BRVotJmt.css";
var config_exports = /* @__PURE__ */ __exportAll({
	contact: () => contact,
	default: () => config_default,
	features: () => features,
	organization: () => organization,
	seo: () => seo,
	theme: () => theme
});
var organization = {
	"slug": "everest",
	"name": "Everest English Boarding Secondary School"
};
var theme = {
	"template": "modern",
	"primary": "#d32f2f"
};
var features = {
	"clubs": true,
	"events": true,
	"notices": true
};
var contact = {
	"phone": "+977 61 521884",
	"email": "office@everestpokhara.edu.np"
};
var seo = {
	"title": "Everest English Boarding Secondary School",
	"description": "A complete school journey in Pokhara, built on close teaching, clear standards and care for every learner."
};
var config_default = {
	organization,
	theme,
	features,
	contact,
	seo
};
var content_exports = /* @__PURE__ */ __exportAll({
	default: () => content_default,
	login: () => login,
	pages: () => pages,
	sidebar: () => sidebar
});
var sidebar = {
	"logo": "/schools/everest/logo.png",
	"tagline": "LEARNING WITH PURPOSE. GROWING WITH CONFIDENCE.",
	"collapsible": {
		"about": {
			"id": "about",
			"label": "About Everest",
			"href": "/about"
		},
		"courses": {
			"id": "courses",
			"label": "Courses",
			"href": "/courses"
		},
		"facilities": {
			"id": "facilities",
			"label": "Facilities",
			"href": "/facilities"
		},
		"gallery": {
			"id": "gallery",
			"label": "Gallery",
			"href": "/gallery"
		},
		"faculty": {
			"id": "faculty",
			"label": "Faculty & Staff",
			"href": "/faculty"
		},
		"notices": {
			"id": "notices",
			"label": "Notice Board",
			"href": "/notices"
		},
		"more_info": {
			"id": "more_info",
			"label": "More Info",
			"children": [
				{
					"id": "calendar",
					"label": "Calendar",
					"href": "/calendar"
				},
				{
					"id": "scholarship",
					"label": "Scholarships",
					"href": "/scholarship"
				},
				{
					"id": "transportation",
					"label": "Transportation",
					"href": "/transportation"
				},
				{
					"id": "resources",
					"label": "Downloads Centre",
					"href": "/resources"
				},
				{
					"id": "result",
					"label": "Board Results",
					"href": "/result"
				}
			]
		},
		"contact": {
			"id": "contact",
			"label": "Contact",
			"href": "/contact"
		}
	}
};
var pages = {
	"homepage": {
		"key": "homepage",
		"title": "Homepage",
		"path": "/",
		"status": "published",
		"hasUnpublishedChanges": false,
		"seoTitle": "Everest English Boarding Secondary School",
		"seoDescription": "A complete school journey in Pokhara, built on close teaching, clear standards and care for every learner.",
		"seoKeywords": "school, everest, pokhara, education, admissions",
		"blocks": [
			{
				"type": "hero",
				"label": "Hero",
				"visible": true,
				"order": 0,
				"fields": {
					"eyebrow": "Admissions open for 2083 B.S. / 2026 A.D.",
					"headline": "LEARNING WITH\nPURPOSE. GROWING\nWITH CONFIDENCE.",
					"subheadline": "A complete school journey in Pokhara, built on close teaching, clear standards and care for every learner.",
					"primaryCtaLabel": "Apply now",
					"primaryCtaHref": "/admissions",
					"secondaryCtaLabel": "Book a tour",
					"secondaryCtaHref": "/contact",
					"image": "/images/placeholder-campus.svg"
				}
			},
			{
				"type": "stats",
				"label": "Key statistics",
				"visible": true,
				"order": 1,
				"fields": { "items": [
					{
						"label": "Years of operation",
						"value": 35
					},
					{
						"label": "Students enrolled",
						"value": 1260,
						"suffix": "+"
					},
					{
						"label": "Teaching staff",
						"value": 78
					},
					{
						"label": "Board pass rate",
						"value": 98,
						"suffix": "%"
					}
				] }
			},
			{
				"type": "intro",
				"label": "Introduction",
				"visible": true,
				"order": 2,
				"fields": {
					"title": "Where curiosity becomes capability",
					"body": "Our programme balances academic rigour with creative and physical development. Small classes, specialist faculty and a culture of mentorship help every student find their strengths.",
					"image": "/images/placeholder-campus.svg"
				}
			},
			{
				"type": "featured_notices",
				"label": "Featured notices",
				"visible": true,
				"order": 3,
				"fields": {
					"title": "Latest from the school office",
					"count": 3,
					"source": "published"
				}
			},
			{
				"type": "featured_events",
				"label": "Featured events",
				"visible": true,
				"order": 4,
				"fields": {
					"title": "What's coming up",
					"count": 4
				}
			},
			{
				"type": "cta",
				"label": "Call to action",
				"visible": true,
				"order": 5,
				"fields": {
					"title": "Applications for 2083 B.S. / 2026 A.D. are open",
					"body": "Submit an enquiry and our admissions team will guide you through assessments, visits and enrolment.",
					"buttonLabel": "Enquire now",
					"buttonHref": "/admissions"
				}
			}
		]
	},
	"about": {
		"key": "about",
		"title": "About",
		"path": "/about",
		"status": "published",
		"hasUnpublishedChanges": false,
		"seoTitle": "About Everest English Boarding Secondary School",
		"seoDescription": "Our history, mission and the people who shape Everest English Boarding Secondary School.",
		"seoKeywords": "about, history, mission, vision, principal, everest",
		"blocks": [
			{
				"type": "hero",
				"label": "Hero",
				"visible": true,
				"order": 0,
				"fields": {
					"eyebrow": "ABOUT EVEREST",
					"headline": "PURPOSE HELD\nOVER TIME.",
					"subheadline": "An institution is not only what it has built. It is what it continues to protect, improve and pass forward.",
					"primaryCtaLabel": "View courses",
					"primaryCtaHref": "/courses",
					"secondaryCtaLabel": "Contact us",
					"secondaryCtaHref": "/contact",
					"image": "/images/placeholder-campus.svg"
				}
			},
			{
				"type": "history",
				"label": "School history",
				"visible": true,
				"order": 1,
				"fields": {
					"title": "Three decades of excellence",
					"body": "Founded in 2048 B.S. with a commitment to accessible, rigorous English-medium education. Its founding purpose still guides daily decisions: know the learner, respect the family, strengthen the community.",
					"image": "/images/placeholder-campus.svg",
					"milestones": [
						{
							"year": "2048 B.S.",
							"title": "Foundation",
							"description": "School established in Pokhara"
						},
						{
							"year": "2058 B.S.",
							"title": "Secondary Level",
							"description": "Added Grades 9-10 (SEE)"
						},
						{
							"year": "2070 B.S.",
							"title": "+2 Programs",
							"description": "Launched Science and Management streams"
						},
						{
							"year": "2080 B.S.",
							"title": "Modern Campus",
							"description": "New facilities and digital infrastructure"
						}
					]
				}
			},
			{
				"type": "mission_vision",
				"label": "Mission & Vision",
				"visible": true,
				"order": 2,
				"fields": {
					"mission": "To provide quality education that nurtures intellectual curiosity, moral character, and social responsibility in every student.",
					"vision": "To be a leading educational institution in Nepal, recognized for academic excellence, holistic development, and community impact.",
					"values": [
						"Curiosity",
						"Integrity",
						"Excellence",
						"Compassion",
						"Collaboration"
					]
				}
			},
			{
				"type": "principal_message",
				"label": "Principal's message",
				"visible": true,
				"order": 3,
				"fields": {
					"name": "Dr. Maya Gurung",
					"role": "Principal",
					"message": "Welcome to Everest English Boarding Secondary School. For over three decades, we have been committed to providing an education that goes beyond textbooks. Our goal is to nurture well-rounded individuals who are prepared not just for examinations, but for life. We believe in the power of curiosity, the importance of character, and the value of community. Every student who walks through our gates becomes part of the Everest family — a family that supports, challenges, and celebrates each other. I invite you to explore our school and discover the Everest difference.",
					"photo": "/images/placeholder-campus.svg"
				}
			}
		]
	},
	"contact": {
		"key": "contact",
		"title": "Contact",
		"path": "/contact",
		"status": "published",
		"hasUnpublishedChanges": false,
		"seoTitle": "Contact Everest English Boarding Secondary School",
		"seoDescription": "Get in touch with Everest English Boarding Secondary School. Choose a department and your enquiry reaches the team best placed to help.",
		"seoKeywords": "contact, everest, pokhara, phone, email, address",
		"blocks": [
			{
				"type": "hero",
				"label": "Hero",
				"visible": true,
				"order": 0,
				"fields": {
					"eyebrow": "CONTACT EVEREST",
					"headline": "THE RIGHT PERSON.\nA CLEAR ANSWER.",
					"subheadline": "Choose a department and your enquiry reaches the team best placed to help.",
					"primaryCtaLabel": "Send message",
					"primaryCtaHref": "#contact-form",
					"image": "/images/placeholder-campus.svg"
				}
			},
			{
				"type": "contact_details",
				"label": "Contact details",
				"visible": true,
				"order": 1,
				"fields": {
					"phone": "071-535962",
					"email": "everestbutwal@gmail.com",
					"address": "Butwal-8, Sukkhanagar, Rupandehi, Lumbini Province, Nepal"
				}
			},
			{
				"type": "office_hours",
				"label": "Office hours",
				"visible": true,
				"order": 2,
				"fields": {
					"weekdays": "Sunday–Friday, 9:00 AM – 4:00 PM",
					"saturday": "Closed",
					"sunday": "Closed",
					"note": "Admissions office open until 2:00 PM on Fridays"
				}
			},
			{
				"type": "map",
				"label": "Map & directions",
				"visible": true,
				"order": 3,
				"fields": {
					"label": "Main Campus",
					"latitude": "27.7006",
					"longitude": "83.4323",
					"directions": "Located in Butwal-8, Sukkhanagar. Accessible by public transport from Milan Chowk (15 min) and Butwal Bus Park (25 min)."
				}
			},
			{
				"type": "social_links",
				"label": "Social links",
				"visible": true,
				"order": 4,
				"fields": {
					"facebook": "https://facebook.com/everestpokhara",
					"instagram": "https://instagram.com/everestpokhara",
					"x": "",
					"youtube": "https://youtube.com/@everestpokhara",
					"linkedin": ""
				}
			}
		]
	},
	"other": {
		"key": "other",
		"title": "Other",
		"path": "/other",
		"status": "draft",
		"hasUnpublishedChanges": true,
		"seoTitle": "",
		"seoDescription": "",
		"seoKeywords": "",
		"blocks": []
	}
};
var login = {};
var content_default = {
	sidebar,
	pages,
	login
};
var configs = /* #__PURE__ */ Object.assign({ "../../schools/everest/config.json": config_exports });
function getSchoolConfig(identifier) {
	return configs[`../../schools/${identifier}/config.json`].default;
}
var contents = /* #__PURE__ */ Object.assign({ "../../schools/everest/content.json": content_exports });
function getSchoolContent(identifier) {
	return contents[`../../schools/${identifier}/content.json`].default;
}
var PUBLIC_CACHE_HEADERS$1 = () => ({
	"Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400"
});
function ErrorComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-bold text-foreground mb-4",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mb-6",
					children: "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => window.location.reload(),
					className: "px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors",
					children: "Refresh Page"
				})
			]
		})
	});
}
var Route$60 = createRootRouteWithContext()({
	async beforeLoad() {
		return { session: await getSessionFn() };
	},
	async loader() {
		const withTimeout = (promise, ms = 4e3) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("Loader query timeout")), ms))]);
		const [configResult, facultyContentResult, loginContentResult, sidebarContentResult, facultyMembersResult, noticesResult, scholarshipsResult] = await Promise.allSettled([
			withTimeout(getSchoolConfigServer({ data: { identifier: "everest" } })),
			withTimeout(getWebsitePageServer({ data: { key: "faculty" } })),
			withTimeout(getWebsitePageServer({ data: { key: "login" } })),
			withTimeout(getSchoolContentServer({ data: { identifier: "everest" } })),
			withTimeout(getFacultyMembersServer()),
			withTimeout(getNoticesServer()),
			withTimeout(getScholarshipsServer())
		]);
		const config = configResult.status === "fulfilled" && configResult.value ? configResult.value : getSchoolConfig("everest");
		const facultyContent = facultyContentResult.status === "fulfilled" ? facultyContentResult.value : null;
		const loginContent = loginContentResult.status === "fulfilled" ? loginContentResult.value : null;
		const sidebarContent = sidebarContentResult.status === "fulfilled" && sidebarContentResult.value ? sidebarContentResult.value : getSchoolContent("everest");
		const facultyMembers = facultyMembersResult.status === "fulfilled" ? facultyMembersResult.value : null;
		const notices = noticesResult.status === "fulfilled" ? noticesResult.value : null;
		const scholarships = scholarshipsResult.status === "fulfilled" ? scholarshipsResult.value : null;
		const content = { sidebar: sidebarContent?.sidebar };
		if (facultyContent) content.faculty = facultyContent;
		if (loginContent) content.login = loginContent;
		if (facultyMembers && facultyMembers.length > 0) content.facultyMembers = facultyMembers;
		if (notices && notices.length > 0) content.notices = notices;
		if (scholarships && scholarships.length > 0) content.scholarships = scholarships;
		return {
			config,
			content
		};
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Everest English Boarding Secondary School" }
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: app_default
			},
			{
				rel: "stylesheet",
				href: src_default
			},
			{
				rel: "stylesheet",
				href: theme_default
			}
		]
	}),
	headers: PUBLIC_CACHE_HEADERS$1,
	notFoundComponent: NotFoundPage,
	errorComponent: ErrorComponent,
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-screen items-center justify-center",
				children: "Loading..."
			}),
			children
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/cms-sections-CVga7mRl.js
var BLOCK_FIELDS = {
	hero: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text",
			placeholder: "Admissions open"
		},
		{
			key: "headline",
			label: "Headline",
			kind: "text"
		},
		{
			key: "subheadline",
			label: "Supporting text",
			kind: "textarea"
		},
		{
			key: "primaryCtaLabel",
			label: "Primary button label",
			kind: "text"
		},
		{
			key: "primaryCtaHref",
			label: "Primary button link",
			kind: "url",
			placeholder: "/admissions"
		},
		{
			key: "secondaryCtaLabel",
			label: "Secondary button label",
			kind: "text"
		},
		{
			key: "secondaryCtaHref",
			label: "Secondary button link",
			kind: "url",
			placeholder: "/contact"
		},
		{
			key: "image",
			label: "Hero image",
			kind: "image"
		}
	],
	headline: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text"
		},
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "body",
			label: "Body",
			kind: "textarea"
		}
	],
	intro: [
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "body",
			label: "Body",
			kind: "textarea"
		},
		{
			key: "image",
			label: "Image",
			kind: "image"
		}
	],
	stats: [{
		key: "items",
		label: "Figures",
		kind: "list",
		addLabel: "Add figure",
		itemLabel: "Figure",
		itemFields: [{
			key: "label",
			label: "Label",
			kind: "text"
		}, {
			key: "value",
			label: "Value",
			kind: "text"
		}]
	}],
	cta: [
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "body",
			label: "Body",
			kind: "textarea"
		},
		{
			key: "buttonLabel",
			label: "Button label",
			kind: "text"
		},
		{
			key: "buttonHref",
			label: "Button link",
			kind: "url"
		}
	],
	featured_events: [{
		key: "title",
		label: "Section title",
		kind: "text"
	}, {
		key: "count",
		label: "How many to show",
		kind: "number",
		help: "Pulled live from the events calendar"
	}],
	featured_notices: [{
		key: "title",
		label: "Section title",
		kind: "text"
	}, {
		key: "count",
		label: "How many to show",
		kind: "number",
		help: "Pulled live from published notices"
	}],
	rich_text: [{
		key: "title",
		label: "Section title",
		kind: "text"
	}, {
		key: "html",
		label: "Content",
		kind: "richtext"
	}],
	history: [
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "body",
			label: "Narrative",
			kind: "textarea"
		},
		{
			key: "image",
			label: "Image",
			kind: "image"
		},
		{
			key: "milestones",
			label: "Milestones",
			kind: "list",
			addLabel: "Add milestone",
			itemLabel: "Milestone",
			itemFields: [{
				key: "year",
				label: "Year",
				kind: "text"
			}, {
				key: "title",
				label: "What happened",
				kind: "text"
			}]
		}
	],
	mission_vision: [
		{
			key: "mission",
			label: "Mission",
			kind: "textarea"
		},
		{
			key: "vision",
			label: "Vision",
			kind: "textarea"
		},
		{
			key: "values",
			label: "Core values",
			kind: "tags",
			placeholder: "Add a value and press Enter"
		}
	],
	principal_message: [
		{
			key: "name",
			label: "Name",
			kind: "text"
		},
		{
			key: "role",
			label: "Role",
			kind: "text"
		},
		{
			key: "message",
			label: "Message",
			kind: "textarea"
		},
		{
			key: "photo",
			label: "Portrait",
			kind: "image"
		}
	],
	facilities: [{
		key: "items",
		label: "Facilities",
		kind: "list",
		addLabel: "Add facility",
		itemLabel: "Facility",
		itemFields: [
			{
				key: "title",
				label: "Name",
				kind: "text"
			},
			{
				key: "description",
				label: "Description",
				kind: "textarea"
			},
			{
				key: "image",
				label: "Image",
				kind: "image"
			}
		]
	}],
	achievements: [{
		key: "items",
		label: "Achievements",
		kind: "list",
		addLabel: "Add achievement",
		itemLabel: "Achievement",
		itemFields: [
			{
				key: "year",
				label: "Year",
				kind: "text"
			},
			{
				key: "title",
				label: "Title",
				kind: "text"
			},
			{
				key: "description",
				label: "Description",
				kind: "textarea"
			}
		]
	}],
	contact_details: [
		{
			key: "phone",
			label: "Phone",
			kind: "text"
		},
		{
			key: "secondaryPhone",
			label: "Secondary phone",
			kind: "text"
		},
		{
			key: "email",
			label: "Email",
			kind: "text"
		},
		{
			key: "admissionsEmail",
			label: "Admissions email",
			kind: "text"
		},
		{
			key: "address",
			label: "Address",
			kind: "textarea"
		}
	],
	office_hours: [
		{
			key: "weekdays",
			label: "Weekdays",
			kind: "text"
		},
		{
			key: "saturday",
			label: "Saturday",
			kind: "text"
		},
		{
			key: "sunday",
			label: "Sunday",
			kind: "text"
		},
		{
			key: "note",
			label: "Note",
			kind: "textarea"
		}
	],
	social_links: [
		{
			key: "facebook",
			label: "Facebook",
			kind: "url"
		},
		{
			key: "instagram",
			label: "Instagram",
			kind: "url"
		},
		{
			key: "x",
			label: "X",
			kind: "url"
		},
		{
			key: "youtube",
			label: "YouTube",
			kind: "url"
		},
		{
			key: "linkedin",
			label: "LinkedIn",
			kind: "url"
		}
	],
	map: [
		{
			key: "label",
			label: "Location label",
			kind: "text"
		},
		{
			key: "latitude",
			label: "Latitude",
			kind: "text"
		},
		{
			key: "longitude",
			label: "Longitude",
			kind: "text"
		},
		{
			key: "directions",
			label: "Directions",
			kind: "textarea"
		}
	],
	announcements: [{
		key: "items",
		label: "Announcements",
		kind: "list",
		addLabel: "Add announcement",
		itemLabel: "Announcement",
		itemFields: [
			{
				key: "title",
				label: "Title",
				kind: "text"
			},
			{
				key: "body",
				label: "Body",
				kind: "textarea"
			},
			{
				key: "date",
				label: "Date",
				kind: "text"
			}
		]
	}],
	gallery_grid: [{
		key: "title",
		label: "Section title",
		kind: "text",
		help: "Albums are pulled from the gallery"
	}],
	faculty: [{
		key: "title",
		label: "Section title",
		kind: "text"
	}, {
		key: "body",
		label: "Body",
		kind: "textarea"
	}],
	academics: [
		{
			key: "title",
			label: "Section title",
			kind: "text"
		},
		{
			key: "body",
			label: "Body",
			kind: "textarea"
		},
		{
			key: "programs",
			label: "Programmes",
			kind: "list",
			addLabel: "Add programme",
			itemLabel: "Programme",
			itemFields: [{
				key: "title",
				label: "Title",
				kind: "text"
			}, {
				key: "description",
				label: "Description",
				kind: "textarea"
			}]
		}
	],
	admissions_info: [
		{
			key: "title",
			label: "Section title",
			kind: "text"
		},
		{
			key: "body",
			label: "Body",
			kind: "textarea"
		},
		{
			key: "deadline",
			label: "Deadline",
			kind: "date"
		},
		{
			key: "steps",
			label: "Steps",
			kind: "list",
			addLabel: "Add step",
			itemLabel: "Step",
			itemFields: [{
				key: "title",
				label: "Title",
				kind: "text"
			}, {
				key: "description",
				label: "Description",
				kind: "textarea"
			}]
		}
	],
	auth_visual: [
		{
			key: "image",
			label: "Image",
			kind: "image"
		},
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text"
		},
		{
			key: "headline",
			label: "Headline",
			kind: "text"
		},
		{
			key: "subheadline",
			label: "Supporting text",
			kind: "textarea"
		}
	],
	auth_intro: [
		{
			key: "kicker",
			label: "Kicker",
			kind: "text"
		},
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "intro",
			label: "Intro",
			kind: "textarea"
		}
	],
	auth_form: [
		{
			key: "backLabel",
			label: "Back link label",
			kind: "text"
		},
		{
			key: "emailLabel",
			label: "Email field label",
			kind: "text"
		},
		{
			key: "passwordLabel",
			label: "Password field label",
			kind: "text"
		},
		{
			key: "forgotLabel",
			label: "Forgot password label",
			kind: "text"
		},
		{
			key: "submitLabel",
			label: "Submit button label",
			kind: "text"
		},
		{
			key: "disclosure",
			label: "Disclosure text",
			kind: "textarea"
		}
	],
	auth_contact: [
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "linkLabel",
			label: "Link label",
			kind: "text"
		},
		{
			key: "linkHref",
			label: "Link",
			kind: "url",
			placeholder: "/contact"
		}
	],
	faculty_header: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text"
		},
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "subtitle",
			label: "Subtitle",
			kind: "textarea"
		}
	],
	faculty_leadership: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text"
		},
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "description",
			label: "Intro copy",
			kind: "textarea"
		}
	],
	faculty_directory: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text"
		},
		{
			key: "title",
			label: "Title",
			kind: "text"
		},
		{
			key: "description",
			label: "Intro copy",
			kind: "textarea"
		}
	]
};
function str(fields, key, fallback = "") {
	const value = fields[key];
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	return fallback;
}
var LOGIN_SECTION_TYPES = [
	"auth_visual",
	"auth_intro",
	"auth_form",
	"auth_contact"
];
var ACTIVATE_SECTION_TYPES = [
	"auth_visual",
	"auth_intro",
	"auth_form"
];
var FACULTY_SECTION_TYPES = [
	"faculty_header",
	"faculty_leadership",
	"faculty_directory"
];
function pageSectionTypes(pageKey) {
	switch (pageKey) {
		case "faculty": return FACULTY_SECTION_TYPES;
		case "login": return LOGIN_SECTION_TYPES;
		case "activate": return ACTIVATE_SECTION_TYPES;
		case "home": return [
			"hero",
			"intro",
			"stats",
			"featured_events"
		];
		case "about": return [
			"history",
			"mission_vision",
			"principal_message"
		];
		case "contact": return [
			"contact_details",
			"office_hours",
			"map"
		];
		case "courses": return ["academics"];
		case "facilities": return ["facilities"];
		case "gallery": return ["gallery_grid"];
		case "calendar": return ["featured_events"];
		case "resources": return ["rich_text"];
		case "result": return ["stats"];
		case "transportation": return ["contact_details"];
		case "notices": return ["announcements", "featured_notices"];
		case "scholarship": return ["admissions_info"];
		default: return ["rich_text"];
	}
}
var SECTION_LABELS = {
	auth_visual: "Visual column",
	auth_intro: "Intro",
	auth_form: "Form",
	auth_contact: "Footer",
	faculty_header: "Header",
	faculty_leadership: "Leadership heading",
	faculty_directory: "Directory heading"
};
/** Default copy for every fixed section — mirrors the static public fallbacks. */
var SECTION_DEFAULTS = {
	auth_visual: {
		image: "/public/schools/everest/landing-footage/frame_0001.jpeg",
		eyebrow: "ScMS entrance",
		headline: "The digital entrance to the school.",
		subheadline: "One community / connected responsibly"
	},
	auth_intro: {
		kicker: "SCHOOL MANAGEMENT SYSTEM",
		title: "Welcome back.",
		intro: "Enter the credentials issued by your school to continue."
	},
	auth_form: {
		backLabel: "Public website",
		emailLabel: "Email",
		passwordLabel: "Password",
		forgotLabel: "Forgot password?",
		submitLabel: "Sign in",
		disclosure: "Frontend demonstration — no credentials are transmitted or stored."
	},
	auth_contact: {
		title: "Don't have access?",
		linkLabel: "Contact the school",
		linkHref: "/contact"
	},
	faculty_header: {
		eyebrow: "Administration",
		title: "Administration & Faculty",
		subtitle: "Every member of staff, with their qualification, the subjects they teach and the hours they keep an open door."
	},
	faculty_leadership: {
		eyebrow: "Leadership",
		title: "Who runs what",
		description: "The six people who carry responsibility for the school. Select a card to see the full profile, office hours and contact details."
	},
	faculty_directory: {
		eyebrow: "Directory",
		title: "Teaching and support faculty",
		description: "Search by name, subject or qualification, or narrow the list to a single department."
	}
};
function sectionLabel(type) {
	return SECTION_LABELS[type] ?? type.replace(/_/g, " ");
}
/** Default fields for a section, used to seed the editor and create blocks. */
function sectionDefaults(type) {
	return SECTION_DEFAULTS[type] ?? {};
}
/** Fields for a section on a page, if a block of that type has been saved. */
function getSectionFields(blocks, type) {
	return blocks?.find((block) => block.type === type)?.fields;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/motion-b60HA8_y.js
/**
* Motion tokens. Seven primitives, four durations, three easings.
* Anything animating in this codebase reads its numbers from here.
*/
var duration = {
	micro: 120,
	standard: 240,
	entrance: 420,
	sheet: 640,
	/** Notice ticker: hold then slide. */
	tickerHold: 5e3,
	tickerSlide: 400,
	/** ledgerCount one-shot count-up. */
	ledger: 900,
	/** ledgerCount tween mode, used by the fee estimator. */
	ledgerTween: 250,
	/** Memory game tile flip and mismatch hold. */
	flip: 240,
	mismatch: 700,
	/** Confirmatory bus-route line draw. */
	routeDraw: 640
};
var easing = {
	/** Entrances and sheets. */
	entrance: [
		.22,
		1,
		.36,
		1
	],
	/** State changes. */
	state: [
		.4,
		0,
		.2,
		1
	]
};
/** Magnitudes referenced by the seven primitives. */
var motionScale = {
	/** frameSequence: each frame scales across its own active window. */
	frameZoomFrom: 1,
	frameZoomTo: 1.04,
	/** sheetRise: pinned backdrop scale and the dimming overlay's peak opacity. */
	backdropZoomTo: 1.06,
	backdropDim: .18,
	/** cardStack. */
	stackOffset: 24,
	stackScale: .96,
	stackOpacity: .45,
	/** revealUp. */
	revealY: 24,
	revealStagger: 60,
	revealMaxSteps: 5,
	revealThreshold: .2,
	/** railFill stroke. */
	railWidth: 2,
	/** magneticHover travel, in px. */
	magnetic: 4,
	/** Campus-plan block lift, in px. */
	planLift: 6,
	/** Sidebar label shift on hover, in px. */
	labelShift: 6,
	/** Tertiary-link arrow shift, in px. */
	arrowShift: 3,
	/** Primary button active scale. */
	press: .98
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/PageFrame-CkOlMGk-.js
/** Shared motion language. Transform + opacity only, editorial easing. */
var EASE = [
	.22,
	1,
	.36,
	1
];
var DUR = {
	fast: .14,
	base: .22,
	slow: .36
};
var STAGGER = .04;
/** Outer page container. Never centre-aligned; editorial gutters only. */
var PageFrame = ({ children, className = "", testId }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-testid": testId,
	className: `mx-auto w-full max-w-frame px-4 pb-28 sm:px-6 lg:px-10 ${className}`,
	children
});
/** Fade + 8px rise. Used for page-level entrance and list staggering. */
var Reveal = ({ children, delay = 0, className = "" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
	className,
	initial: {
		opacity: 0,
		y: 8
	},
	animate: {
		opacity: 1,
		y: 0
	},
	transition: {
		duration: DUR.slow,
		ease: EASE,
		delay
	},
	children
});
/**
* Page masthead shared by all five sections.
*
* Plain and legible: one quiet eyebrow, a serif title at a comfortable
* reading size, a single explanatory line, and an optional fact row.
* No banner, no image, no stacked calls to action — the page simply
* says what it is and then gets on with the content.
*/
var PageHeader = ({ eyebrow, title, subtitle, lead, meta, actions, testId = "page-header" }) => {
	const sub = subtitle || lead;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pt-12 sm:pt-16",
		"data-testid": testId,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "t-eyebrow",
				"data-testid": `${testId}-eyebrow`,
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "t-page-title mt-4 max-w-[24ch] text-foreground",
				"data-testid": `${testId}-title`,
				children: title
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 max-w-[58ch] font-sans text-[15px] leading-[1.65] text-muted-foreground sm:text-base",
				"data-testid": `${testId}-subtitle`,
				children: sub
			})
		] }), meta && meta.length > 0 || actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
			delay: STAGGER,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 border-t border-rule pt-6",
				children: [meta && meta.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "flex flex-wrap gap-x-12 gap-y-5",
					"data-testid": `${testId}-meta`,
					children: meta.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "t-eyebrow",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-2 font-display text-[17px] font-semibold leading-none text-foreground",
						children: item.value
					})] }, item.label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 max-w-full basis-full sm:basis-auto",
					children: actions
				}) : null]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-10 border-t border-rule" })]
	});
};
/**
* A distinct, clearly delimited page section.
*
* Each one opens on a full-width hairline so the eye can tell where one
* subject ends and the next begins, rather than reading the page as a
* single dense wall.
*/
var Section = ({ children, className = "", testId }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
	className: `mt-section lg:mt-section-lg ${className}`,
	"data-testid": testId,
	children
});
/** Section opener: hairline, quiet label, serif title, optional single line. */
var SectionHeading = ({ eyebrow, title, description, aside, rule = true, className = "", testId }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: `${rule ? "border-t border-rule-strong pt-6" : ""} ${className}`,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-end justify-between gap-x-8 gap-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "t-eyebrow",
				children: eyebrow
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "t-h2 mt-2 text-foreground",
				"data-testid": testId,
				children: title
			})]
		}), aside ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2 pb-1",
			children: aside
		}) : null]
	}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 max-w-[62ch] text-[14px] leading-relaxed text-muted-foreground",
		children: description
	}) : null]
});
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/error-CqkTqwg-.js
var ERROR = {
	INVITATION_USED: "INVITATION_USED",
	INVITATION_EXPIRED: "INVITATION_EXPIRED"
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-B6FnglFX.js
function getContext() {
	return { queryClient: new QueryClient({ defaultOptions: { queries: {
		staleTime: 6e5,
		gcTime: 36e5,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 1
	} } }) };
}
var $$splitComponentImporter$47 = () => import("../_onboard-DMkKbrJQ.mjs");
/**
* The onboarding cluster (signup, activate, public login). Uses the same frame
* as the public and /user layouts so the sidebar, ticker and footer appear
* consistently everywhere outside the admin shell.
*/
var Route$59 = createFileRoute("/_onboard")({ component: lazyRouteComponent($$splitComponentImporter$47, "component") });
var $$splitComponentImporter$46 = () => import("../_public-CkvSw0L1.mjs");
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
var Route$58 = createFileRoute("/_public")({ component: lazyRouteComponent($$splitComponentImporter$46, "component") });
var $$splitComponentImporter$45 = () => import("./admin-CzsbDoQc.mjs");
var Route$57 = createFileRoute("/admin")({
	component: lazyRouteComponent($$splitComponentImporter$45, "component"),
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: "/login" });
	}
});
/**
* Marks a region of a public page as an editable CMS section. Outside the
* live preview it renders its children untouched; in preview mode it wraps
* them and overlays a click target that asks the admin window to open the
* section editor.
*/
function CmsSectionBox({ preview, sectionType, onSelect, children, className = "", testId }) {
	if (!preview) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `group relative ${className}`,
		"data-cms-section": sectionType,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-10 rounded-[inherit] outline-2 outline-dashed -outline-offset-1 outline-accent/35 transition-colors duration-150 group-hover:outline-accent/70",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelect(sectionType),
				title: `Edit ${sectionLabel(sectionType)}`,
				"aria-label": `Edit ${sectionLabel(sectionType)}`,
				"data-testid": testId ?? `cms-section-hit-${sectionType}`,
				className: "pointer-events-auto absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-md border border-accent/60 bg-background px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-wide text-accent shadow-sm transition-colors duration-150 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
					className: "h-3 w-3",
					"aria-hidden": "true"
				}), sectionLabel(sectionType)]
			}),
			children
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, testId, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		"data-testid": testId,
		...props
	});
});
Button.displayName = "Button";
gsapWithCSS.registerPlugin(ScrollTrigger);
function useImageReveal() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const element = ref.current;
		if (!element) return void 0;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void 0;
		const context = gsapWithCSS.context(() => {
			gsapWithCSS.fromTo(element, { clipPath: "inset(0 0 100% 0)" }, {
				clipPath: "inset(0 0 0% 0)",
				duration: 1.15,
				ease: "expo.out",
				scrollTrigger: {
					trigger: element,
					start: "top 82%",
					once: true
				}
			});
		}, element);
		return () => context.revert();
	}, []);
	return ref;
}
function SectionLabel({ number, children, inverse = false, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `section-label ${inverse ? "section-label--inverse" : ""}`,
		"data-testid": testId || "section-label",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: number }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" })
		]
	});
}
function ImageReveal({ src, alt, className = "", caption, eager = false, testId }) {
	const ref = useImageReveal();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		ref,
		className: `image-reveal ${className}`,
		"data-testid": testId || "image-reveal",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt,
			loading: eager ? "eager" : "lazy"
		}), caption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: caption }) : null]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var VISUAL_IMAGE = "/public/schools/everest/landing-footage/frame_0001.jpeg";
function AuthVisual({ fields }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-visual",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageReveal, {
			src: str(fields, "image", VISUAL_IMAGE),
			alt: "School architecture marking the entrance to Everest",
			eager: true,
			testId: "login-visual-image"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-visual__overlay",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
					number: "04",
					inverse: true,
					children: str(fields, "eyebrow", "ScMS entrance")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: str(fields, "headline", "The digital entrance to the school.") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: str(fields, "subheadline", "One community / connected responsibly") })
			]
		})]
	});
}
function AuthIntro({ fields, orgName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "auth-kicker",
			children: str(fields, "kicker", "SCHOOL MANAGEMENT SYSTEM")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			id: "login-title",
			className: "t-page-title text-foreground",
			children: str(fields, "title", "Welcome back.")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "auth-intro",
			style: { color: "var(--c-black)" },
			children: str(fields, "intro", orgName ? `Enter the credentials issued by ${orgName} to continue.` : "Enter the credentials issued by your school to continue.")
		})
	] });
}
function LoginForm({ fields }) {
	const [values, setValues] = (0, import_react.useState)({
		email: "",
		password: ""
	});
	const [errors, setErrors] = (0, import_react.useState)({});
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [recoveryOpen, setRecoveryOpen] = (0, import_react.useState)(false);
	const update = (event) => {
		const { name, value } = event.target;
		setValues((current) => ({
			...current,
			[name]: value
		}));
		setErrors((current) => ({
			...current,
			[name]: ""
		}));
		if (status === "success") setStatus("idle");
	};
	const submit = async (event) => {
		event.preventDefault();
		const next = {};
		if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter the email address connected to your school account.";
		if (values.password.length < 8) next.password = "Password must contain at least 8 characters.";
		setErrors(next);
		if (Object.keys(next).length) {
			setStatus("error");
			document.getElementById(Object.keys(next)[0] === "email" ? "login-email" : "login-password")?.focus();
			return;
		}
		setStatus("loading");
		let userName = "";
		let isSuperOrAdmin = false;
		const result = await authClient.signIn.email({
			email: values.email,
			password: values.password
		});
		if (result.error) {
			setStatus("error");
			setErrors({ email: result.error.message || "Invalid email or password." });
			return;
		}
		if (result.data?.user) {
			userName = result.data.user.name ?? values.email.split("@")[0];
			isSuperOrAdmin = result.data.user.role === "superadmin" || result.data.user.role === "admin";
		}
		toast.success(`Welcome back, ${userName}`);
		setStatus("success");
		if (isSuperOrAdmin) window.location.href = "/admin/overview";
		else window.location.href = "/";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		noValidate: true,
		className: "auth-form",
		"data-testid": "login-form",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `form-control ${errors.email ? "form-control--error" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "login-email",
						style: { color: "var(--c-black)" },
						children: str(fields, "emailLabel", "Email")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "login-email",
						name: "email",
						type: "email",
						value: values.email,
						onChange: update,
						autoComplete: "email",
						"aria-invalid": Boolean(errors.email),
						"aria-describedby": errors.email ? "login-email-error" : void 0,
						className: "editorial-input",
						disabled: status === "loading",
						"data-testid": "login-email-input"
					}),
					errors.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "login-email-error",
						className: "field-error",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors.email]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `form-control ${errors.password ? "form-control--error" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "label-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "login-password",
							style: { color: "var(--c-black)" },
							children: str(fields, "passwordLabel", "Password")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRecoveryOpen((value) => !value),
							"data-testid": "forgot-password-button",
							style: {
								color: "var(--c-yellow)",
								fontWeight: 500
							},
							children: str(fields, "forgotLabel", "Forgot password?")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "password-field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "login-password",
							name: "password",
							type: showPassword ? "text" : "password",
							value: values.password,
							onChange: update,
							autoComplete: "current-password",
							"aria-invalid": Boolean(errors.password),
							"aria-describedby": errors.password ? "login-password-error" : void 0,
							className: "editorial-input",
							disabled: status === "loading",
							"data-testid": "login-password-input"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "password-toggle",
							onClick: () => setShowPassword((value) => !value),
							"aria-label": showPassword ? "Hide password" : "Show password",
							"data-testid": "login-password-toggle",
							style: { color: "var(--c-red) !important" },
							children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { "aria-hidden": "true" })
						})]
					}),
					errors.password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "login-password-error",
						className: "field-error",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors.password]
					}) : null
				]
			}),
			recoveryOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "auth-note",
				role: "status",
				"data-testid": "password-recovery-note",
				children: "Password recovery requires the connected ScMS service. Contact the school office for account assistance."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				className: "institution-button institution-button--full",
				disabled: status === "loading",
				"data-testid": "login-form-submit-button",
				children: [status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "spin",
					"aria-hidden": "true"
				}) : null, status === "loading" ? "Checking interface…" : str(fields, "submitLabel", "Sign in")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "demo-disclosure",
				style: { color: "var(--c-yellow)" },
				children: str(fields, "disclosure", "Frontend demonstration — no credentials are transmitted or stored.")
			})
		]
	});
}
function AuthContact({ fields }) {
	const href = str(fields, "linkHref", "/contact");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-contact",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: { color: "var(--c-black)" },
			children: str(fields, "title", "Don't have access?")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: href,
			"data-testid": "login-contact-school-link",
			style: {
				color: "var(--c-red)",
				fontWeight: 500
			},
			children: [
				str(fields, "linkLabel", "Contact the school"),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "→"
				})
			]
		})]
	});
}
function pick(blocks, type) {
	return blocks.find((block) => block.type === type);
}
/**
* Renders the sign-in page as a composition of the auth_* section blocks.
* Sections without a block fall back to the default copy, so a page with no
* blocks renders the static sign-in layout. In admin live-preview mode each
* section is wrapped in a click target that opens the section editor.
*/
function AuthPage({ blocks, orgName, preview = false, onSelectSection }) {
	const list = blocks ?? [];
	const visual = pick(list, "auth_visual");
	const intro = pick(list, "auth_intro");
	const form = pick(list, "auth_form");
	const contact = pick(list, "auth_contact");
	const select = onSelectSection ?? (() => {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "auth-page overflow-x-hidden min-w-0",
		"aria-labelledby": "login-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
			preview,
			sectionType: "auth_visual",
			onSelect: select,
			className: "min-w-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthVisual, { fields: visual?.fields ?? {} })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
				preview,
				sectionType: "auth_form",
				onSelect: select,
				testId: "cms-section-hit-auth_back",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "auth-back",
					"data-testid": "login-back-home-link",
					style: { color: "var(--c-black)" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							"aria-hidden": "true",
							style: { color: "var(--c-red)" }
						}),
						" ",
						str(form?.fields ?? {}, "backLabel", "Public website")
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-panel__inner",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
						preview,
						sectionType: "auth_intro",
						onSelect: select,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthIntro, {
							fields: intro?.fields ?? {},
							orgName
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
						preview,
						sectionType: "auth_form",
						onSelect: select,
						testId: "cms-section-hit-auth_form",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, { fields: form?.fields ?? {} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
						preview,
						sectionType: "auth_contact",
						onSelect: select,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContact, { fields: contact?.fields ?? {} })
					})
				]
			})]
		})]
	});
}
var exploreLinks = [
	["Home", "/"],
	["About", "/about"],
	["Contact", "/contact"],
	["Signup", "/signup"]
];
/**
* The original institutional footer: a black band with the oversized "With
* Everest" call-to-action, the school logo, quick explore links and the
* created-year attribution.
*/
function Footer() {
	const { sidebar } = useSchoolContent();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "bg-black pb-10 pt-16 text-white",
		"data-testid": "footer",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "m-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
						children: "Reach the Highest Point"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						className: "group inline-flex w-fit items-center gap-3 text-[clamp(42px,7vw,110px)] leading-[0.9] no-underline md:gap-6",
						to: "/contact",
						"data-testid": "footer-with-everest",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "With Everest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
							"aria-hidden": "true",
							className: "h-11 w-11 text-yellow transition-transform duration-200 ease-in group-hover:translate-x-1 group-hover:-translate-y-1"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-10 mt-14 h-px bg-gray-700" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr_1.5fr_1fr]",
					children: [
						sidebar.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: sidebar.logo,
							alt: "",
							className: "w-32"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							"aria-label": "Footer",
							className: "flex flex-col gap-2.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-2 text-[9px] uppercase tracking-[0.12em] text-yellow",
								children: "Explore"
							}), exploreLinks.map(([label, to]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to,
								className: "w-fit text-white no-underline transition-colors hover:text-yellow",
								children: label
							}, label))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2.5 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-2 text-[9px] uppercase tracking-[0.12em] text-yellow",
									children: "Institution"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "m-0 leading-normal text-muted-foreground",
									children: "Nepal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "m-0 leading-normal text-muted-foreground",
									children: "School Administrator"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start justify-between gap-2 text-[9px] text-muted-foreground md:items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCMS / Everest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-testid": "footer-year",
								children: (/* @__PURE__ */ new Date()).getFullYear()
							})]
						})
					]
				})
			]
		})
	});
}
/** Institutional identity. Every rendering of the school's name reads from here. */
var school = {
	nameEn: "Everest English Boarding Secondary School",
	nameNe: "श्री एभरेस्ट इङ्लिश बोर्डिङ माध्यमिक विद्यालय",
	shortEn: "Everest EBSS",
	wordmark: ["EVEREST", "ENGLISH BOARDING"],
	/** Editable CMS field. Left as a clear placeholder — no motto has been adopted. */
	tagline: {
		value: "",
		placeholder: "TAGLINE — SET IN CMS",
		help: "One short line, 4 to 7 words. Shown in the sidebar under the crest."
	},
	establishedBs: 2042,
	establishedAd: 1985,
	registrationNo: "Reg. 116/052/053, Kaski District Education Office",
	address: {
		line1: "Butwal-8, Sukkhanagar",
		line2: "Butwal Sub-Metropolitan City",
		district: "Rupandehi, Lumbini Province",
		country: "Nepal",
		postal: "32907",
		addressNe: "बुटवल उपमहानगरपालिका वडा नं ८, रुपन्देही"
	},
	geo: {
		lat: 28.2096,
		lng: 83.9856
	},
	phones: [{
		label: "NTC",
		value: "+977-61-460218",
		href: "tel:+97761460218"
	}, {
		label: "Ncell",
		value: "+977-9806512340",
		href: "tel:+9779806512340"
	}],
	email: "info@everestebss.edu.np",
	admissionsEmail: "admissions@everestebss.edu.np",
	/** Sunday to Friday. Saturday is the weekly holiday. */
	hours: [
		{
			weekday: 0,
			name: "Sunday",
			open: "07:00",
			close: "16:30"
		},
		{
			weekday: 1,
			name: "Monday",
			open: "07:00",
			close: "16:30"
		},
		{
			weekday: 2,
			name: "Tuesday",
			open: "07:00",
			close: "16:30"
		},
		{
			weekday: 3,
			name: "Wednesday",
			open: "07:00",
			close: "16:30"
		},
		{
			weekday: 4,
			name: "Thursday",
			open: "07:00",
			close: "16:30"
		},
		{
			weekday: 5,
			name: "Friday",
			open: "07:00",
			close: "14:00"
		},
		{
			weekday: 6,
			name: "Saturday",
			open: null,
			close: null
		}
	],
	admissions: {
		windowLabel: "Admissions 2026 — 2083 BS intake",
		openBs: "2083-11-01",
		closeBs: "2083-12-20",
		documentsRequired: 6,
		documents: [
			"Birth registration certificate",
			"Character certificate from the previous school",
			"Transfer certificate",
			"Marksheet of the last completed grade",
			"Two passport photographs of the applicant",
			"A copy of one guardian’s citizenship certificate"
		]
	}
};
var notices = [
	{
		id: "n-see-routine",
		title: "SEE 2083 examination routine published by the National Examinations Board",
		publishedAt: "2026-01-12",
		href: "/calendar",
		pinned: true
	},
	{
		id: "n-admission-open",
		title: "Admissions for the 2083 BS session open from 15 Falgun for all levels",
		publishedAt: "2026-01-08",
		href: "/courses",
		pinned: true
	},
	{
		id: "n-first-term",
		title: "First terminal examination begins 18 Bhadra for grades one to ten",
		publishedAt: "2025-12-28",
		href: "/calendar",
		pinned: false
	},
	{
		id: "n-dashain",
		title: "School closed for Dashain from 24 Ashwin, reopening 6 Kartik",
		publishedAt: "2025-12-20",
		href: "/calendar",
		pinned: false
	},
	{
		id: "n-results",
		title: "Grade twelve NEB results published — collect transcripts from the office",
		publishedAt: "2025-12-11",
		href: "/about",
		pinned: false
	},
	{
		id: "n-bus-hemja",
		title: "A second morning bus has been added on the Hemja route from 1 Magh",
		publishedAt: "2025-12-02",
		href: "/facilities",
		pinned: false
	},
	{
		id: "n-parents-day",
		title: "Parents’ day for the basic level falls on 9 Poush, 10:00 to 13:00",
		publishedAt: "2025-11-25",
		href: "/calendar",
		pinned: false
	},
	{
		id: "n-fee-notice",
		title: "Third instalment of tuition is due by the last working day of Poush",
		publishedAt: "2025-11-18",
		href: "/courses",
		pinned: false
	}
];
var departments = [
	{
		id: "d-admissions",
		name: "Admissions",
		contact: "Sarita Gurung, Admissions Officer",
		phones: ["+977-61-460218", "+977-9806512340"],
		email: "admissions@everestebss.edu.np",
		hours: "Sunday to Friday, 08:00 – 16:00"
	},
	{
		id: "d-accounts",
		name: "Accounts",
		contact: "Bishnu Prasad Adhikari, Accountant",
		phones: ["+977-61-460218"],
		email: "accounts@everestebss.edu.np",
		hours: "Sunday to Friday, 09:00 – 15:30"
	},
	{
		id: "d-principal",
		name: "Principal’s Office",
		contact: "Dr Rajendra Bahadur Thapa, Principal",
		phones: ["+977-61-460219"],
		email: "principal@everestebss.edu.np",
		hours: "Sunday to Thursday, 10:00 – 13:00, by appointment"
	},
	{
		id: "d-transport",
		name: "Transport",
		contact: "Kamal Bahadur Pariyar, Transport In-charge",
		phones: ["+977-9846021178"],
		email: "transport@everestebss.edu.np",
		hours: "Sunday to Friday, 06:00 – 17:00"
	},
	{
		id: "d-hostel",
		name: "Hostel and Welfare",
		contact: "Muna Sharma, Warden",
		phones: ["+977-9856034421"],
		email: "hostel@everestebss.edu.np",
		hours: "All week, 06:00 – 21:00"
	},
	{
		id: "d-general",
		name: "General Enquiry",
		contact: "Front Office",
		phones: ["+977-61-460218"],
		email: "info@everestebss.edu.np",
		hours: "Sunday to Friday, 07:30 – 16:30"
	}
];
departments.find((d) => d.id === "d-accounts").phones[0];
/** Where a bus-stop request goes, since there is no enquiry endpoint. */
var TRANSPORT_EMAIL = departments.find((d) => d.id === "d-transport").email;
function relative(iso) {
	const then = (/* @__PURE__ */ new Date(iso + "T00:00:00Z")).getTime();
	const days = Math.max(0, Math.round((Date.now() - then) / 864e5));
	if (days === 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 30) return days + " days ago";
	const months = Math.round(days / 30);
	if (months < 12) return months + (months === 1 ? " month ago" : " months ago");
	const years = Math.round(days / 365);
	return years + (years === 1 ? " year ago" : " years ago");
}
var ordered = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned));
/**
* A 44px strip carrying live school notices. Items hold for five seconds and
* slide vertically for 400ms - never a continuous marquee, which is unreadable.
* It pauses on hover, on keyboard focus, and on its own visible control
* (WCAG 2.2.2). The rotating text is hidden from assistive technology; the full
* list is exposed as a real <ul> underneath instead.
*/
function NoticeTicker({ className, testId = "notice-ticker" }) {
	const reduced = useReducedMotion();
	const [i, setI] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [focused, setFocused] = (0, import_react.useState)(false);
	const timer = (0, import_react.useRef)(null);
	const paused = !playing || hovered || focused || Boolean(reduced);
	(0, import_react.useEffect)(() => {
		if (paused) return;
		timer.current = window.setTimeout(() => setI((n) => (n + 1) % ordered.length), duration.tickerHold);
		return () => {
			if (timer.current) window.clearTimeout(timer.current);
		};
	}, [i, paused]);
	const notice = ordered[i];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-ticker w-full items-center gap-4 border-b-hair border-n-200 bg-[#FEF2F2] px-4", className),
		"data-testid": testId,
		"data-paused": paused ? "true" : "false",
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		onFocusCapture: () => setFocused(true),
		onBlurCapture: () => setFocused(false),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "u-label shrink-0 border-hair border-accent px-2 py-1 text-accent",
				children: "Notice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-w-0 flex-1 overflow-hidden",
				style: { height: 24 },
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					initial: false,
					mode: "wait",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.div, {
						initial: reduced ? { opacity: 0 } : {
							y: 24,
							opacity: 0
						},
						animate: reduced ? { opacity: 1 } : {
							y: 0,
							opacity: 1
						},
						exit: reduced ? { opacity: 0 } : {
							y: -24,
							opacity: 0
						},
						transition: {
							duration: duration.tickerSlide / 1e3,
							ease: easing.state
						},
						className: "absolute inset-0 flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-body-s text-ink",
							"data-testid": "ticker-current",
							children: notice.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label hidden shrink-0 text-n-600 sm:inline",
							children: relative(notice.publishedAt)
						})]
					}, notice.id)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setPlaying((p) => !p),
				"data-testid": "ticker-toggle",
				"aria-pressed": !playing,
				className: "inline-flex h-tap w-tap shrink-0 items-center justify-center rounded-ui border-none bg-transparent text-n-600 hover:text-ink hover:bg-transparent",
				children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
					"aria-hidden": "true",
					size: 14
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
					"aria-hidden": "true",
					size: 14
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: playing ? "Pause the notice rotation" : "Play the notice rotation"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/notices",
				className: "u-label mr-4 hidden shrink-0 text-n-600 underline underline-offset-4 hover:text-ink lg:inline",
				"data-testid": "ticker-view-all",
				children: "View all notices"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "sr-only",
				children: ordered.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					n.title,
					" — published ",
					relative(n.publishedAt)
				] }, n.id))
			})
		]
	});
}
function PageShell({ children, variant = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-h-svh pt-topbar lg:pt-0", variant === "default" && "lg:pl-[var(--nav-w)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: variant === "overlay" ? "lg:pl-[var(--nav-w)]" : "",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "u-container",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeTicker, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				tabIndex: -1,
				className: "outline-none",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
var Route$56 = createFileRoute("/login")({
	beforeLoad: ({ context, location }) => {
		const search = location.search;
		if (String(search.cms) === "1" || String(search["allow-when-logged-in"]) === "true") return;
		if (context.session) {
			const role = context.session.user.role;
			if (role === "admin" || role === "superadmin") throw redirect({ to: "/admin/overview" });
			throw redirect({ to: "/user" });
		}
	},
	loader: async ({ location }) => {
		if (String(location.search.cms ?? "") === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "login" } }) };
		return { previewPage: null };
	},
	component: RouteComponent$1
});
function RouteComponent$1() {
	const cms = (useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$56.useLoaderData();
	const config = useSchoolConfig();
	const published = useWebsitePageContent("login");
	const preview = String(cms ?? "") === "1";
	const loginPage = preview ? previewPage : published;
	const onSelectSection = (sectionType) => {
		window.parent?.postMessage({
			source: "scms-cms",
			type: "select-section",
			pageKey: "login",
			sectionType
		}, "*");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPage, {
		blocks: loginPage?.blocks ?? null,
		orgName: config.organization.name,
		preview,
		onSelectSection
	}) });
}
var $$splitComponentImporter$44 = () => import("./user-CeM8qGNy.mjs");
var Route$55 = createFileRoute("/user")({ component: lazyRouteComponent($$splitComponentImporter$44, "component") });
var $$splitComponentImporter$43 = () => import("../_public-DZ_G7Xqo.mjs");
var PUBLIC_CACHE_HEADERS = () => ({
	"Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400"
});
var Route$54 = createFileRoute("/_public/")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "home" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$43, "component"),
	headers: PUBLIC_CACHE_HEADERS
});
var $$splitComponentImporter$42 = () => import("./about-BAiwQXQ6.mjs");
var Route$53 = createFileRoute("/_public/about")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "about" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$42, "component")
});
var $$splitComponentImporter$41 = () => import("./calendar-DqKgRCoc.mjs");
var Route$52 = createFileRoute("/_public/calendar")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "calendar" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$41, "component")
});
var $$splitComponentImporter$40 = () => import("./contact-CZ99fYZ2.mjs");
var Route$51 = createFileRoute("/_public/contact")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "contact" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$40, "component")
});
var $$splitComponentImporter$39 = () => import("./course-finder-BBjb5k7L.mjs");
var Route$50 = createFileRoute("/_public/course-finder")({ component: lazyRouteComponent($$splitComponentImporter$39, "component") });
var $$splitComponentImporter$38 = () => import("./courses-DX3Be9Tx.mjs");
var Route$49 = createFileRoute("/_public/courses")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "courses" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
var $$splitComponentImporter$37 = () => import("./facilities-B63_Daqh.mjs");
var Route$48 = createFileRoute("/_public/facilities")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "facilities" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$37, "component")
});
var $$splitComponentImporter$36 = () => import("./faculty-CDuTWBxB.mjs");
var Route$47 = createFileRoute("/_public/faculty")({
	loader: async ({ location }) => {
		if (String(location.search.cms ?? "") === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "faculty" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
/**
* Responsive picture sources.
* Photographs are served AVIF-first with a WebP fallback and a JPEG floor,
* at 480 / 960 / 1440 / 1920, with explicit intrinsic dimensions so nothing
* shifts while they load.
*/
var IMAGE_WIDTHS = [
	480,
	960,
	1440,
	1920
];
function withParams(src, w, fm, q = 68) {
	return `${src}${src.includes("?") ? "&" : "?"}w=${w}&q=${q}&fm=${fm}&fit=crop&auto=format`;
}
function srcSet(src, fm) {
	return IMAGE_WIDTHS.map((w) => `${withParams(src, w, fm)} ${w}w`).join(", ");
}
function fallbackSrc(src, w = 960) {
	return withParams(src, w, "jpg");
}
/** A single AVIF url, used for <link rel=preload> on the hero's first frame. */
function preloadSrc(src, w = 1440) {
	return withParams(src, w, "avif");
}
/**
* PRIMITIVE 4 - revealUp
* One-shot entrance. translateY(24px) plus opacity 0 to rest over 420ms,
* triggered at 20% visibility. Siblings stagger by 60ms, capped at five steps.
* Never re-fires on scroll back up.
*/
function RevealUp({ children, index = 0, as = "div", className = "", ...rest }) {
	const reduced = useReducedMotion();
	const delay = Math.min(index, motionScale.revealMaxSteps) * motionScale.revealStagger / 1e3;
	if (reduced) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(as, {
		className,
		...rest,
		children
	});
	const Comp = motion$1[as] ?? motion$1.div;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		className,
		initial: {
			opacity: 0,
			y: motionScale.revealY
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			amount: motionScale.revealThreshold
		},
		transition: {
			duration: duration.entrance / 1e3,
			ease: easing.entrance,
			delay
		},
		...rest,
		children
	});
}
/**
* PRIMITIVE 5 - railFill
* A 2px line whose scaleY / scaleX maps to a section progress value. Used as a
* reading-position indicator, and as the progress rail in the stream chooser.
*/
function RailFill({ progress, orientation = "vertical", className = "", label }) {
	const vertical = orientation === "vertical";
	const style = vertical ? { scaleY: progress } : { scaleX: progress };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: (vertical ? "w-rule" : "h-rule w-full") + " bg-n-200 " + className,
		role: label ? "progressbar" : void 0,
		"aria-label": label,
		"aria-hidden": label ? void 0 : true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.div, {
			className: vertical ? "h-full w-rule bg-accent" : "h-rule w-full bg-accent",
			style: {
				...style,
				transformOrigin: vertical ? "top center" : "left center",
				willChange: "transform"
			}
		})
	});
}
var easeOut = (t) => 1 - Math.pow(1 - t, 3);
/**
* PRIMITIVE 6 - ledgerCount
*
* once  : counts 0 to target over 900ms on first intersection, then never again.
* tween : travels to each new target over 250ms, for the live fee estimator.
*
* Tabular numerals in both modes so nothing shifts as digits change.
*/
function LedgerCount({ value, mode = "once", format = (n) => String(Math.round(n)), className = "", testId }) {
	const ref = (0, import_react.useRef)(null);
	const inView = useInView(ref, {
		once: true,
		amount: .4
	});
	const reduced = useReducedMotion();
	const [display, setDisplay] = (0, import_react.useState)(mode === "once" ? 0 : value);
	const fromRef = (0, import_react.useRef)(mode === "once" ? 0 : value);
	const rafRef = (0, import_react.useRef)(null);
	const firedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (reduced) {
			setDisplay(value);
			fromRef.current = value;
			return;
		}
		if (mode === "once") {
			if (!inView || firedRef.current) return;
			firedRef.current = true;
		}
		const from = fromRef.current;
		const to = value;
		if (from === to) {
			setDisplay(to);
			return;
		}
		const ms = mode === "once" ? duration.ledger : duration.ledgerTween;
		const start = performance.now();
		const step = (now) => {
			const t = Math.min(1, (now - start) / ms);
			setDisplay(from + (to - from) * easeOut(t));
			if (t < 1) rafRef.current = requestAnimationFrame(step);
			else fromRef.current = to;
		};
		rafRef.current = requestAnimationFrame(step);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			fromRef.current = to;
		};
	}, [
		value,
		inView,
		mode,
		reduced
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		ref,
		className: "tnum " + className,
		"data-testid": testId,
		children: format(display)
	});
}
/**
* AVIF first, WebP fallback, JPEG floor. Explicit intrinsic dimensions always,
* so a photograph never causes layout shift while it loads.
*/
function Picture({ image, sizes = "100vw", className = "", imgClassName = "h-full w-full object-cover", priority = false, decorative = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("picture", {
		className,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				type: "image/avif",
				srcSet: srcSet(image.src, "avif"),
				sizes
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				type: "image/webp",
				srcSet: srcSet(image.src, "webp"),
				sizes
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: fallbackSrc(image.src, 960),
				alt: decorative ? "" : image.alt,
				width: image.width,
				height: image.height,
				loading: priority ? "eager" : "lazy",
				decoding: priority ? "sync" : "async",
				className: imgClassName,
				...priority ? { fetchPriority: "high" } : {}
			})
		]
	});
}
var FAN = [
	{
		r: -7,
		x: -18,
		y: 6
	},
	{
		r: -2.5,
		x: -6,
		y: 0
	},
	{
		r: 2.5,
		x: 6,
		y: 0
	},
	{
		r: 7,
		x: 18,
		y: 6
	}
];
/**
* SIGNATURE INTERACTION - Gallery
* The fan. Each event is a physical stack of photographs; hovering or focusing
* one fans the top four out in a shallow arc. Clicking enters the event and the
* stack expands into the grid, with a shared-element transition on the top photo.
*
* Under reduced motion the stack renders as a flat cover tile with a count badge.
*/
function PhotoFan({ album, onOpen, index }) {
	const reduced = Boolean(useReducedMotion());
	const [lifted, setLifted] = (0, import_react.useState)(false);
	const top = album.photos.slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onOpen(album),
		onMouseEnter: () => setLifted(true),
		onMouseLeave: () => setLifted(false),
		onFocus: () => setLifted(true),
		onBlur: () => setLifted(false),
		"data-testid": "photo-stack-" + album.id,
		"aria-label": `Open ${album.event}, ${album.year} — ${album.photos.length} photographs`,
		className: "group flex flex-col gap-4 text-left !border-0 !bg-transparent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "relative block aspect-[4/3] w-full",
			children: [reduced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-0 overflow-hidden rounded-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picture, {
					image: album.photos[0],
					sizes: "(min-width: 1024px) 30vw, 90vw"
				})
			}) : top.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.span, {
				className: "absolute inset-0 block overflow-hidden rounded-card",
				style: { zIndex: top.length - i },
				animate: lifted ? {
					rotate: FAN[i].r,
					x: FAN[i].x,
					y: FAN[i].y
				} : {
					rotate: i * -1.2,
					x: i * -3,
					y: i * 3
				},
				transition: {
					duration: duration.standard / 1e3,
					ease: easing.state
				},
				children: i === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.span, {
					layoutId: "album-cover-" + album.id,
					className: "block h-full w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picture, {
						image: p,
						sizes: "(min-width: 1024px) 30vw, 90vw"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picture, {
					image: p,
					sizes: "(min-width: 1024px) 30vw, 90vw",
					decorative: true
				})
			}, p.src + i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "u-label absolute bottom-3 right-3 z-10 rounded-pill bg-black/60 px-3 py-1 tnum text-white",
				children: [album.photos.length, " photos"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex flex-col gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "u-label text-accent",
					children: [
						String(index + 1).padStart(2, "0"),
						" / ",
						album.category,
						" · ",
						album.year
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "u-display text-display-m text-ink",
					children: album.event
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "u-label text-n-600",
					children: album.date
				})
			]
		})]
	});
}
/**
* Full-screen lightbox. Focus is trapped while open, background scroll is
* locked, Escape closes and returns focus to the tile that opened it, and only
* the two neighbouring images are preloaded.
*/
function Lightbox({ photos, index, title, onClose, onIndex }) {
	const reduced = useReducedMotion();
	const dialogRef = (0, import_react.useRef)(null);
	const closeRef = (0, import_react.useRef)(null);
	const [touchX, setTouchX] = (0, import_react.useState)(null);
	const go = (0, import_react.useCallback)((d) => onIndex((index + d + photos.length) % photos.length), [
		index,
		photos.length,
		onIndex
	]);
	(0, import_react.useEffect)(() => {
		closeRef.current?.focus();
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				go(1);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				go(-1);
			} else if (e.key === "Tab") {
				const nodes = dialogRef.current?.querySelectorAll("button, [href], input, [tabindex]:not([tabindex=\"-1\"])");
				if (!nodes || nodes.length === 0) return;
				const list = Array.from(nodes);
				const first = list[0];
				const last = list[list.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [go, onClose]);
	const photo = photos[index];
	const next = photos[(index + 1) % photos.length];
	const prev = photos[(index - 1 + photos.length) % photos.length];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: dialogRef,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		"data-testid": "lightbox",
		className: "fixed inset-0 z-overlay flex flex-col",
		style: { backgroundColor: "rgba(23, 18, 15, 0.94)" },
		onTouchStart: (e) => setTouchX(e.touches[0].clientX),
		onTouchEnd: (e) => {
			if (touchX === null) return;
			const dx = e.changedTouches[0].clientX - touchX;
			if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
			setTouchX(null);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
				rel: "preload",
				as: "image",
				href: preloadSrc(next.src, 1440)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
				rel: "preload",
				as: "image",
				href: preloadSrc(prev.src, 1440)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4 px-4 py-4 md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "u-label text-paper",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "u-label tnum text-paper",
						"data-testid": "lightbox-counter",
						children: [
							String(index + 1).padStart(2, "0"),
							" / ",
							String(photos.length).padStart(2, "0")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						ref: closeRef,
						type: "button",
						onClick: onClose,
						"data-testid": "lightbox-close",
						"aria-label": "Close the image viewer",
						className: "inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-red-500/40 text-red-500 hover:border-red-500 !bg-transparent !border-red-500/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							"aria-hidden": "true",
							size: 18
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => go(-1),
						"aria-label": "Previous photograph",
						"data-testid": "lightbox-prev",
						className: "absolute left-2 z-10 inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-red-500/40 text-red-500 hover:border-red-500 !bg-transparent !border-red-500/40 md:left-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
							"aria-hidden": "true",
							size: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.div, {
						initial: reduced ? { opacity: 0 } : {
							opacity: 0,
							scale: .985
						},
						animate: reduced ? { opacity: 1 } : {
							opacity: 1,
							scale: 1
						},
						transition: {
							duration: (reduced ? 160 : duration.standard) / 1e3,
							ease: easing.entrance
						},
						className: "flex h-full max-h-full w-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("picture", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
								type: "image/avif",
								srcSet: srcSet(photo.src, "avif"),
								sizes: "90vw"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
								type: "image/webp",
								srcSet: srcSet(photo.src, "webp"),
								sizes: "90vw"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: fallbackSrc(photo.src, 1440),
								alt: photo.alt,
								width: photo.width,
								height: photo.height,
								className: "max-h-[70svh] w-auto max-w-full object-contain"
							})
						] })
					}, photo.src + index),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => go(1),
						"aria-label": "Next photograph",
						"data-testid": "lightbox-next",
						className: "absolute right-2 z-10 inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-red-500/40 text-red-500 hover:border-red-500 !bg-transparent !border-red-500/40 md:right-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							"aria-hidden": "true",
							size: 20
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-8 pt-4 md:px-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-measure text-body-m text-paper",
					children: photo.alt
				})
			})
		]
	});
}
/**
* Filter chip. The selected state fills with ink AND adds a check glyph, so it
* never depends on colour alone.
*/
function Chip({ selected, onClick, children, className, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-pressed": selected,
		"data-testid": testId,
		className: cn("inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background", selected ? "border-accent/40 bg-accent/12 font-medium text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground", className),
		children: [selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			"aria-hidden": "true",
			size: 14,
			className: "text-accent"
		}) : null, children]
	});
}
function Eyebrow({ children, className, tone = "accent" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("u-label", tone === "accent" && "text-accent", tone === "muted" && "text-n-600", tone === "paper" && "text-paper/80", className),
		children
	});
}
/** Mono caption stating in one line what a widget does. Required on every widget. */
function WidgetCaption({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "u-label text-n-600",
		children
	});
}
var U = "https://images.unsplash.com/";
/** Every photograph on the site is declared here once, with final-quality alt text. */
function img(id, alt, width = 1600, height = 1067) {
	return {
		src: U + id,
		alt,
		width,
		height
	};
}
var photos = {
	campusMorning: img("photo-1562774053-701939374585", "The main academic block seen across the front lawn in early morning light"),
	campusModern: img("photo-1600585154340-be6161a56a0c", "The newer science and computing wing at the eastern edge of the campus"),
	campusBlock: img("photo-1576495199011-eb94736d05d6", "The three-storey secondary block with its open corridor walkways"),
	campusFacade: img("photo-1613896527026-f195d5c818ed", "The painted facade of the primary block facing the assembly ground"),
	assemblyAerial: img("photo-1541888946425-d81bb19240f5", "Students lined up in house rows on the assembly ground, seen from above"),
	assemblyHall: img("photo-1524178232363-1fb2b075b655", "The multipurpose hall filled for a morning assembly"),
	auditorium: img("photo-1519452635265-7b1fbfd1e4e0", "Rows of seating in the school auditorium"),
	classroomLesson: img("photo-1577896851231-70ef18881754", "A teacher working at the board with a full class of secondary students"),
	classroomEmpty: img("photo-1580582932707-520aed937b7b", "A smart classroom set up with paired desks before the first period"),
	classroomWriting: img("photo-1517048676732-d65bc937f952", "Students writing at their desks during a terminal examination"),
	classroomPrimary: img("photo-1588072432836-e10032774350", "Basic level pupils working on a drawing task at a shared table"),
	classroomStudents: img("photo-1509062522246-3755977927d7", "A grade nine class in session, seen from the back of the room"),
	labGlass: img("photo-1532094349884-543bc11b234d", "Glassware set out on a laboratory bench before a chemistry practical"),
	labPour: img("photo-1554475901-4538ddfbccc2", "A student measuring a solution into a conical flask during a titration"),
	labWork: img("photo-1581091226825-a6a2a5aee158", "Two students recording readings from an experiment in the physics laboratory"),
	computerLab: img("photo-1531482615713-2afd69097998", "Students working at desktop machines in the computer laboratory"),
	computerDesks: img("photo-1519389950473-47ba0277781c", "Workstations laid out along the length of the computer laboratory"),
	library: img("photo-1524995997946-a1c2e315a42f", "The curved shelving of the main reading room in the school library"),
	libraryAisle: img("photo-1481627834876-b7833e8f5570", "A quiet aisle between the reference shelves in the library"),
	libraryReading: img("photo-1567168544813-cc03465b4fa8", "A senior student reading at the library window"),
	libraryStacks: img("photo-1427504494785-3a9ca7044f45", "A student choosing a title from the fiction stacks"),
	libraryGroup: img("photo-1523240795612-9a054b0db644", "Students working together at a reading table in the library"),
	hostelRoom: img("photo-1590490360182-c33d57733427", "A residential hostel room with two beds and study desks"),
	hostelWash: img("photo-1584622650111-993a426fbf0a", "The washroom block serving the residential hostel"),
	canteenInterior: img("photo-1555396273-367ea4eb4db5", "The canteen seating area between the morning and lunch services"),
	canteenCounter: img("photo-1552566626-52f8b828add9", "The serving counter at the school canteen"),
	canteenMeal: img("photo-1546069901-ba9599a7e63c", "A prepared lunch tray of rice, lentils and seasonal vegetables"),
	road: img("photo-1602081957921-9137a5d6eaee", "The valley road at first light on the Hemja pickup route"),
	sportsTrack: img("photo-1461896836934-ffe607ba8211", "A runner in the blocks at the start of the hundred metres"),
	sportsField: img("photo-1607962837359-5e7e89f86776", "Students running on the ground at the close of the school day"),
	sportsCourt: img("photo-1544919982-b61976f0ba43", "The covered basketball court after evening practice"),
	sportsCycling: img("photo-1541625602330-2277a4c46182", "The inter-house cycling event on the ring road"),
	sportsSwim: img("photo-1530549387789-4c1017266635", "A swimmer at the district-level meet"),
	sportsTeam: img("photo-1533560904424-a0c61dc306fc", "The senior football team during a warm-up drill"),
	medicalRoom: img("photo-1538108149393-fbbd81895907", "The school medical room with two observation beds"),
	medicalNurse: img("photo-1631217868264-e5b90bb7e133", "The resident health assistant checking a pupil in the medical room"),
	graduation: img("photo-1541339907198-e08756dedf3f", "Caps thrown at the close of the grade twelve farewell"),
	celebration: img("photo-1541532713592-79a0317b6b77", "Students celebrating together after the annual results were published"),
	medals: img("photo-1571008592377-e362723e8998", "Junior athletes with their medals after the annual sports meet"),
	groupOutdoors: img("photo-1517486808906-6ca8b3f04846", "A group of senior students together on the front steps"),
	groupStudy: img("photo-1522202176988-66273c2fd55f", "Three students working through a problem set together"),
	groupProject: img("photo-1571260899304-425eee4c7efc", "A project group presenting their work to classmates"),
	whiteboard: img("photo-1596495577886-d920f1fb7238", "A physics derivation worked through on the whiteboard"),
	whiteboardPlan: img("photo-1596496181871-9681eacf9764", "A teacher mapping out the term plan on the staff room board"),
	stage: img("photo-1516450360452-9312f5e86fc7", "The cultural programme stage during the annual day"),
	sunflowers: img("photo-1591035897819-f4bdf739f446", "Students on the annual excursion in the fields above the valley"),
	mountainsDawn: img("photo-1506905925346-21bda4d32df4", "The Annapurna range at dawn, seen from the Sarangkot excursion"),
	mountainsValley: img("photo-1464822759023-fed622ff2c3b", "The valley below Sarangkot on the morning of the school excursion"),
	mountainsRidge: img("photo-1470071459604-3b5ec3a7fe05", "The ridge walk taken by the senior excursion group"),
	mountainsNight: img("photo-1519681393784-d120267933ba", "The night sky above the valley during the astronomy club field trip"),
	booksStack: img("photo-1497633762265-9d179a990aa6", "A stack of set texts issued at the start of term"),
	booksApple: img("photo-1503676260728-1c00da094a0b", "Reading blocks and picture books from the basic level resource shelf"),
	pencils: img("photo-1513542789411-b6a5d4f31634", "Coloured pencils laid out for the art period"),
	writing: img("photo-1434030216411-0b793f4b4173", "A pupil writing up notes at the end of a lesson"),
	writingChild: img("photo-1560785496-3c9d27877182", "A basic level pupil practising handwriting in an exercise book"),
	notebook: img("photo-1517971129774-8a2b38fa128e", "Revision notes open beside a set of past papers"),
	laptopWork: img("photo-1516321318423-f06f85e504b3", "A student working through a coding exercise"),
	meeting: img("photo-1454165804606-c3d57bc86b40", "The parent teacher meeting in the staff room"),
	courtEmpty: img("photo-1544919982-b61976f0ba43", "The assembly ground before the school gates opened, 2055 BS"),
	loveToLearn: img("photo-1546410531-bb4caa6b424d", "A hand-painted sign in the primary corridor"),
	portraitPrincipal: img("photo-1522075469751-3a6694fb2f61", "Portrait of the principal in the school office", 900, 1200),
	portraitVice: img("photo-1580894732444-8ecded7900cd", "Portrait of the vice principal outside the staff room", 900, 1200),
	portraitCoordinator: img("photo-1596495578065-6e0763fa1178", "Portrait of the academic coordinator", 900, 1200),
	portraitScience: img("photo-1584697964358-3e14ca57658b", "Portrait of the head of the science department in the library", 900, 1200),
	portraitPrimary: img("photo-1544717305-2782549b5136", "Portrait of the head of the basic level", 900, 1200),
	portraitAlumnus: img("photo-1509098681029-b45e9c845022", "Portrait of an alumnus of the 2072 BS batch", 900, 1200),
	portraitParent: img("photo-1543269664-7eef42226a21", "Portrait of a parent of two pupils at the school", 900, 1200),
	portraitStudent: img("photo-1567168544813-cc03465b4fa8", "Portrait of a grade twelve science student in the library", 900, 1200)
};
var galleryIntro = {
	eyebrow: "04 / THE YEAR",
	statement: ["ONE YEAR,", "GATHERED."],
	support: "Photographs from the 2082 and 2083 BS sessions, filed by event. Captions are written by the class that took them, which is why some of them are better than others."
};
var albums = [
	{
		id: "a-sports",
		event: "Annual Sports Meet",
		year: "2083 BS",
		category: "Sports",
		date: "3 Mangsir 2083",
		photos: [
			photos.sportsTrack,
			photos.sportsField,
			photos.medals,
			photos.sportsCourt,
			photos.sportsTeam,
			photos.sportsCycling,
			photos.sportsSwim,
			photos.assemblyAerial
		]
	},
	{
		id: "a-science",
		event: "Science Exhibition",
		year: "2083 BS",
		category: "Academic",
		date: "10 Ashwin 2083",
		photos: [
			photos.labGlass,
			photos.labPour,
			photos.labWork,
			photos.whiteboard,
			photos.groupProject,
			photos.computerLab
		]
	},
	{
		id: "a-saraswati",
		event: "Saraswati Puja",
		year: "2083 BS",
		category: "Festival",
		date: "14 Magh 2083",
		photos: [
			photos.stage,
			photos.celebration,
			photos.groupOutdoors,
			photos.booksStack,
			photos.pencils
		]
	},
	{
		id: "a-farewell",
		event: "Grade Twelve Farewell",
		year: "2082 BS",
		category: "Ceremony",
		date: "25 Chaitra 2082",
		photos: [
			photos.graduation,
			photos.celebration,
			photos.groupOutdoors,
			photos.auditorium,
			photos.assemblyHall
		]
	},
	{
		id: "a-excursion",
		event: "Sarangkot Excursion",
		year: "2082 BS",
		category: "Excursion",
		date: "18 Falgun 2082",
		photos: [
			photos.mountainsDawn,
			photos.mountainsValley,
			photos.mountainsRidge,
			photos.sunflowers,
			photos.mountainsNight,
			photos.road
		]
	},
	{
		id: "a-library",
		event: "Library Week",
		year: "2082 BS",
		category: "Academic",
		date: "6 Bhadra 2082",
		photos: [
			photos.library,
			photos.libraryAisle,
			photos.libraryReading,
			photos.libraryStacks,
			photos.libraryGroup,
			photos.booksApple
		]
	},
	{
		id: "a-quiz",
		event: "Inter-house Quiz",
		year: "2083 BS",
		category: "Academic",
		date: "5 Shrawan 2083",
		photos: [
			photos.assemblyHall,
			photos.auditorium,
			photos.groupStudy,
			photos.groupProject,
			photos.whiteboardPlan
		]
	},
	{
		id: "a-classroom",
		event: "A Week in Class",
		year: "2083 BS",
		category: "Everyday",
		date: "Bhadra 2083",
		photos: [
			photos.classroomLesson,
			photos.classroomStudents,
			photos.classroomWriting,
			photos.classroomPrimary,
			photos.writingChild,
			photos.writing,
			photos.notebook,
			photos.loveToLearn
		]
	},
	{
		id: "a-parents",
		event: "Parents’ Day",
		year: "2083 BS",
		category: "Ceremony",
		date: "9 Poush 2083",
		photos: [
			photos.meeting,
			photos.assemblyHall,
			photos.groupStudy,
			photos.campusMorning
		]
	}
];
var galleryCategories = Array.from(new Set(albums.map((a) => a.category))).sort();
var galleryYears = Array.from(new Set(albums.map((a) => a.year))).sort().reverse();
var totalPhotos = albums.reduce((n, a) => n + a.photos.length, 0);
/** Deliberately varied tile sizes on a strict 12-column base. */
var SPANS = [
	"lg:col-span-6 lg:row-span-2",
	"lg:col-span-3",
	"lg:col-span-3",
	"lg:col-span-3",
	"lg:col-span-3",
	"lg:col-span-4",
	"lg:col-span-4",
	"lg:col-span-4"
];
var Route$46 = createFileRoute("/_public/gallery")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "gallery" } }) };
		return { previewPage: null };
	},
	component: RouteComponent
});
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$46.useLoaderData();
	useWebsitePageContent("gallery");
	const reduced = Boolean(useReducedMotion());
	const [category, setCategory] = (0, import_react.useState)(null);
	const [year, setYear] = (0, import_react.useState)(null);
	const [entered, setEntered] = (0, import_react.useState)(null);
	const [lightbox, setLightbox] = (0, import_react.useState)(null);
	const tileRefs = (0, import_react.useRef)({});
	const lastTile = (0, import_react.useRef)(null);
	const filtered = (0, import_react.useMemo)(() => albums.filter((a) => (!category || a.category === category) && (!year || a.year === year)), [category, year]);
	const openLightbox = (photos, index, title, key) => {
		lastTile.current = key;
		setLightbox({
			photos,
			index,
			title
		});
	};
	const closeLightbox = () => {
		const key = lastTile.current;
		setLightbox(null);
		if (key) window.setTimeout(() => tileRefs.current[key]?.focus(), 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: galleryIntro.eyebrow,
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerCount, {
					value: totalPhotos,
					testId: "gallery-count"
				}),
				" ",
				"PHOTOGRAPHS"
			] }),
			lead: galleryIntro.support
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			className: "!mt-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					"data-testid": "gallery-filter-category",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "u-label mr-2 text-n-600",
						children: "Category"
					}), galleryCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						selected: category === c,
						onClick: () => setCategory(category === c ? null : c),
						testId: "chip-cat-" + c.toLowerCase(),
						children: c
					}, c))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					"data-testid": "gallery-filter-year",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label mr-2 text-n-600",
							children: "Academic year"
						}),
						galleryYears.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							selected: year === y,
							onClick: () => setYear(year === y ? null : y),
							testId: "chip-year-" + y.replace(/\s+/g, "-"),
							children: y
						}, y)),
						category || year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							selected: false,
							onClick: () => {
								setCategory(null);
								setYear(null);
							},
							testId: "chip-gallery-clear",
							children: "Clear filters"
						}) : null
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10 mb-16",
			"data-testid": "gallery-body",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				children: entered ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.div, {
					initial: reduced ? { opacity: 0 } : {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					exit: reduced ? { opacity: 0 } : {
						opacity: 0,
						y: -12
					},
					transition: {
						duration: duration.standard / 1e3,
						ease: easing.entrance
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-12 flex flex-wrap items-end justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Eyebrow, { children: [
								entered.category,
								" · ",
								entered.year,
								" · ",
								entered.date
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "u-display text-display-l text-ink",
								children: entered.event
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => setEntered(null),
							testId: "gallery-back",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
								"aria-hidden": "true",
								size: 14
							}), "All events"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-12",
						children: entered.photos.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: SPANS[i % SPANS.length],
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								ref: (el) => {
									tileRefs.current[entered.id + "-" + i] = el;
								},
								onClick: () => openLightbox(entered.photos, i, entered.event, entered.id + "-" + i),
								"data-testid": "gallery-tile-" + i,
								className: "group relative block h-full w-full overflow-hidden rounded-card !border-0 !bg-transparent",
								children: [i === 0 && !reduced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.span, {
									layoutId: "album-cover-" + entered.id,
									className: "block h-full w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picture, {
										image: p,
										sizes: "(min-width: 1024px) 45vw, 92vw"
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picture, {
									image: p,
									sizes: "(min-width: 1024px) 30vw, 45vw"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label pointer-events-none absolute inset-x-0 bottom-0 bg-[#FEF2F2]/95 px-3 py-2 text-left text-ink opacity-0 transition-opacity duration-micro ease-state group-hover:opacity-100 group-focus-visible:opacity-100",
									children: p.alt
								})]
							})
						}, p.src + i))
					})]
				}, "album-" + entered.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.div, {
					initial: reduced ? { opacity: 0 } : {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					exit: reduced ? { opacity: 0 } : {
						opacity: 0,
						y: -12
					},
					transition: {
						duration: duration.standard / 1e3,
						ease: easing.entrance
					},
					children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 border-y-hair border-n-300 py-12",
						"data-testid": "gallery-empty",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-measure text-body-l text-ink",
							children: [
								"No album matches those filters. There are ",
								albums.length,
								" ",
								"events in total across ",
								galleryYears.length,
								" academic years."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								setCategory(null);
								setYear(null);
							},
							testId: "gallery-empty-clear",
							className: "w-fit",
							children: "Clear the filters"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-12 sm:grid-cols-2 lg:grid-cols-3",
						children: filtered.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealUp, {
							as: "li",
							index: i,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoFan, {
								album: a,
								index: i,
								onOpen: setEntered
							})
						}, a.id))
					})
				}, "stacks")
			})
		}),
		lightbox ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
			photos: lightbox.photos,
			index: lightbox.index,
			title: lightbox.title,
			onClose: closeLightbox,
			onIndex: (i) => setLightbox({
				...lightbox,
				index: i
			})
		}) : null
	] });
}
var $$splitComponentImporter$35 = () => import("./notices-DIi5iR30.mjs");
var Route$45 = createFileRoute("/_public/notices")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "notices" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./resources-CgwlJOKA.mjs");
var Route$44 = createFileRoute("/_public/resources")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "resources" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$34, "component"),
	loader: async () => {
		return { resources: await getResourcesServer() };
	}
});
var $$splitComponentImporter$33 = () => import("./result-QJ3S2iqh.mjs");
var Route$43 = createFileRoute("/_public/result")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "result" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$33, "component"),
	loader: async () => {
		return { results: await getBoardResultsServer() };
	}
});
var $$splitComponentImporter$32 = () => import("./scholarship-BcPg0kje.mjs");
var Route$42 = createFileRoute("/_public/scholarship")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "scholarship" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./transportation-nqs4qWKK.mjs");
var Route$41 = createFileRoute("/_public/transportation")({
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "transportation" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$31, "component"),
	loader: async () => {
		return { routes: await getBusRoutesServer() };
	}
});
var Route$40 = createFileRoute("/admin/")({ beforeLoad: () => {
	throw redirect({ to: "/admin/overview" });
} });
var $$splitComponentImporter$30 = () => import("../_-BBKtljtK.mjs");
var Route$39 = createFileRoute("/admin/$")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = () => import("./activity-S10CAsLE.mjs");
var Route$38 = createFileRoute("/admin/activity")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./admissions-BvCGC73f.mjs");
var Route$37 = createFileRoute("/admin/admissions")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./attendance-Cunys0nD.mjs");
var Route$36 = createFileRoute("/admin/attendance")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./classes-DogdTD2j.mjs");
var Route$35 = createFileRoute("/admin/classes")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./courses-BJg8G10J.mjs");
var Route$34 = createFileRoute("/admin/courses")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./events-CmR1p2R0.mjs");
var Route$33 = createFileRoute("/admin/events")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./gallery-JpOjW9xO.mjs");
var Route$32 = createFileRoute("/admin/gallery")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./notices-BSEQeH5c.mjs");
var Route$31 = createFileRoute("/admin/notices")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./overview-C5O7FRgi.mjs");
var Route$30 = createFileRoute("/admin/overview")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./payments-D_qawbc2.mjs");
var Route$29 = createFileRoute("/admin/payments")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./scholarships-_ZxztkO6.mjs");
var Route$28 = createFileRoute("/admin/scholarships")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./settings-0NqWNW_n.mjs");
var Route$27 = createFileRoute("/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./staff-DK6WO5Ll.mjs");
var Route$26 = createFileRoute("/admin/staff")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./students-ur6t_cZm.mjs");
var Route$25 = createFileRoute("/admin/students")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./transportation-ZoYkYP82.mjs");
var Route$24 = createFileRoute("/admin/transportation")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./users-BwyxAKT7.mjs");
var Route$23 = createFileRoute("/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./website-Cz5G1kWH.mjs");
var Route$22 = createFileRoute("/admin/website")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./activate.index-CO4Fj1LT.mjs");
var Route$21 = createFileRoute("/_onboard/activate/")({
	beforeLoad: ({ context, location }) => {
		const search = location.search;
		if (String(search.cms) === "1" || String(search["allow-when-logged-in"]) === "true") return;
		if (context.session) {
			if (context.session.user.role === "admin" || context.session.user.role === "superadmin") throw redirect({ to: "/admin/overview" });
			throw redirect({ to: "/user" });
		}
	},
	loader: async ({ location }) => {
		const search = location.search;
		if (String(search.cms) === "1") return { previewPage: await getWebsitePagePreviewServer({ data: { key: "activate" } }) };
		return { previewPage: null };
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var TokenSchema = string().min(1);
var getInvite = createServerFn().validator(TokenSchema).handler(createSsrRpc("65fb0672cf45a7fdf8383c5f852d4ce20bbde40aeec6c2adf8feb392e0874571"));
var $$splitComponentImporter$11 = () => import("./activate._token-DgT_gVNn.mjs");
var $$splitErrorComponentImporter = () => import("./activate._token-DCPETIMf.mjs");
var $$splitNotFoundComponentImporter = () => import("./activate._token-CjQSwrbn.mjs");
var Route$20 = createFileRoute("/_onboard/activate/$token")({
	beforeLoad: async ({ context, location }) => {
		const search = location.search;
		if (String(search.cms) === "1" || String(search["allow-when-logged-in"]) === "true") return;
		if (context.session) {
			if (context.session.user.role === "admin" || context.session.user.role === "superadmin") throw redirect({ to: "/admin/overview" });
			throw redirect({ to: "/user" });
		}
	},
	loader: async ({ params }) => {
		const invite = await getInvite({ data: decodeURIComponent(params.token || "").trim().replace(/\/+$/, "") });
		if (!invite) throw notFound();
		if (invite.usedAt) throw new Error(ERROR.INVITATION_USED);
		if (invite.expiresAt < /* @__PURE__ */ new Date()) throw new Error(ERROR.INVITATION_EXPIRED);
		return invite;
	},
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admissions._id-BNBANL1q.mjs");
var Route$19 = createFileRoute("/admin/admissions/$id")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./classes._id-1cmoM1Rs.mjs");
var Route$18 = createFileRoute("/admin/classes/$id")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./courses._id-C-6Z7AtC.mjs");
var Route$17 = createFileRoute("/admin/courses/$id")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./events._id-DK6Cg4mX.mjs");
var Route$16 = createFileRoute("/admin/events/$id")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./gallery._id-C_VagxqR.mjs");
var Route$15 = createFileRoute("/admin/gallery/$id")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./notices._id-Dg1eeuE5.mjs");
var Route$14 = createFileRoute("/admin/notices/$id")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./notices.new-CwPJZWbU.mjs");
var Route$13 = createFileRoute("/admin/notices/new")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./payments._id-D2M0lTYw.mjs");
var Route$12 = createFileRoute("/admin/payments/$id")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./staff._id-Cpy1z8DZ.mjs");
var Route$11 = createFileRoute("/admin/staff/$id")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./students._id-zjXCoeSt.mjs");
var Route$10 = createFileRoute("/admin/students/$id")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var Route$9 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: async ({ request, params }) => {
		console.log("Auth GET:", request.url, params);
		console.log("Auth handler type:", typeof auth.handler);
		const body = await request.clone().text();
		console.log("Request body:", body);
		const response = await auth.handler(request);
		console.log("Auth GET response:", response.status);
		return response;
	},
	POST: async ({ request, params }) => {
		console.log("Auth POST:", request.url, params);
		console.log("Auth handler type:", typeof auth.handler);
		const body = await request.clone().text();
		console.log("Request body:", body);
		const response = await auth.handler(request);
		console.log("Auth POST response:", response.status);
		return response;
	}
} } });
function toWebsitePage(page) {
	return {
		id: page.id,
		key: page.key,
		title: page.title,
		path: page.path,
		status: page.status,
		hasUnpublishedChanges: page.hasUnpublishedChanges,
		seoTitle: page.seoTitle ?? "",
		seoDescription: page.seoDescription ?? "",
		seoKeywords: page.seoKeywords ?? "",
		blocks: page.blocks.map((block) => ({
			id: block.id,
			type: block.type,
			label: block.label,
			visible: block.visible,
			order: block.order,
			fields: block.fields,
			updatedAt: block.updatedAt.toISOString(),
			createdAt: block.createdAt.toISOString()
		})),
		publishedAt: page.publishedAt?.toISOString() ?? null,
		updatedAt: page.updatedAt.toISOString(),
		createdAt: page.createdAt.toISOString(),
		updatedBy: page.updatedBy
	};
}
async function listWebsitePages() {
	return (await prisma.websitePage.findMany({
		include: { blocks: { orderBy: { order: "asc" } } },
		orderBy: { key: "asc" }
	})).map(toWebsitePage);
}
async function getWebsitePage(key) {
	const page = await prisma.websitePage.findUnique({
		where: { key },
		include: { blocks: { orderBy: { order: "asc" } } }
	});
	return page ? toWebsitePage(page) : null;
}
async function getPublishedPage(key) {
	const page = await prisma.websitePage.findUnique({
		where: {
			key,
			status: "published"
		},
		include: { blocks: {
			where: { visible: true },
			orderBy: { order: "asc" }
		} }
	});
	return page ? toWebsitePage(page) : null;
}
async function saveSectionFields(key, sectionType, fields, actor) {
	const page = await findPage(key);
	const existing = page.blocks.find((b) => b.type === sectionType);
	if (existing) await prisma.contentBlock.update({
		where: { id: existing.id },
		data: {
			fields,
			updatedAt: /* @__PURE__ */ new Date()
		}
	});
	else {
		const defaults = BLOCK_LIBRARY_DEFAULTS[sectionType];
		if (!defaults) throw new Error("Unknown section type");
		const maxOrder = page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;
		await prisma.contentBlock.create({ data: {
			type: sectionType,
			label: sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/_/g, " "),
			visible: true,
			order: maxOrder + 1,
			fields: {
				...defaults,
				...fields
			},
			pageId: page.id
		} });
	}
	await prisma.websitePage.update({
		where: { key },
		data: {
			updatedAt: /* @__PURE__ */ new Date(),
			updatedBy: actor.name,
			hasUnpublishedChanges: true
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function findPage(key) {
	const page = await getWebsitePage(key);
	if (!page) throw new Error("Page not found");
	return page;
}
async function updateBlockFields(key, blockId, fields, _actor) {
	if (!(await findPage(key)).blocks.find((b) => b.id === blockId)) throw new Error("Block not found");
	await prisma.contentBlock.update({
		where: { id: blockId },
		data: {
			fields,
			updatedAt: /* @__PURE__ */ new Date()
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function toggleBlockVisibility(key, blockId, _actor) {
	const block = (await findPage(key)).blocks.find((b) => b.id === blockId);
	if (!block) throw new Error("Block not found");
	await prisma.contentBlock.update({
		where: { id: blockId },
		data: {
			visible: !block.visible,
			updatedAt: /* @__PURE__ */ new Date()
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function moveBlock(key, blockId, direction, _actor) {
	const page = await findPage(key);
	const sorted = [...page.blocks].sort((a, b) => a.order - b.order);
	const index = sorted.findIndex((b) => b.id === blockId);
	const target = direction === "up" ? index - 1 : index + 1;
	if (index === -1 || target < 0 || target >= sorted.length) return page;
	[sorted[index], sorted[target]] = [sorted[target], sorted[index]];
	sorted.forEach((b, i) => {
		b.order = i;
	});
	await prisma.$transaction(sorted.map((b, i) => prisma.contentBlock.update({
		where: { id: b.id },
		data: {
			order: i,
			updatedAt: /* @__PURE__ */ new Date()
		}
	})));
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function reorderBlocks(key, orderedIds, _actor) {
	await prisma.$transaction(orderedIds.map((id, index) => prisma.contentBlock.update({
		where: { id },
		data: {
			order: index,
			updatedAt: /* @__PURE__ */ new Date()
		}
	})));
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
var BLOCK_LIBRARY_DEFAULTS = {
	hero: {
		eyebrow: "Admissions open",
		headline: "A new headline for your school",
		subheadline: "Describe what makes your school distinctive in one or two sentences.",
		primaryCtaLabel: "Apply now",
		primaryCtaHref: "/admissions",
		secondaryCtaLabel: "Book a tour",
		secondaryCtaHref: "/contact",
		image: "/images/placeholder-campus.svg"
	},
	headline: {
		eyebrow: "Notice",
		title: "Announcement title",
		body: "Short supporting sentence."
	},
	intro: {
		title: "Introduction title",
		body: "Two to three sentences introducing this part of the school.",
		image: "/images/placeholder-campus.svg"
	},
	stats: { items: [
		{
			label: "Students",
			value: "1,180"
		},
		{
			label: "Faculty",
			value: "96"
		},
		{
			label: "Ratio",
			value: "12:1"
		},
		{
			label: "Placement",
			value: "98%"
		}
	] },
	rich_text: {
		title: "Section title",
		html: "<p>Write your content here.</p>"
	},
	cta: {
		title: "Ready to join us?",
		body: "Tell visitors what to do next.",
		buttonLabel: "Get in touch",
		buttonHref: "/contact"
	},
	featured_notices: {
		title: "Latest notices",
		count: 3,
		source: "published"
	},
	featured_events: {
		title: "Upcoming events",
		count: 4
	},
	gallery_grid: {
		title: "Life at school",
		albumIds: []
	},
	facilities: { items: [{
		title: "Facility",
		description: "Short description.",
		image: "/images/placeholder-campus.svg"
	}] },
	achievements: { items: [{
		year: "2026",
		title: "Achievement",
		description: "What was won and by whom."
	}] },
	principal_message: {
		name: "Principal name",
		role: "Principal",
		message: "A short message to families.",
		photo: ""
	},
	contact_details: {
		phone: "",
		email: "",
		address: ""
	},
	office_hours: {
		weekdays: "8:00 AM – 4:30 PM",
		saturday: "Closed",
		sunday: "Closed",
		note: ""
	},
	social_links: {
		facebook: "",
		instagram: "",
		x: "",
		youtube: "",
		linkedin: ""
	},
	map: {
		label: "Main Campus",
		latitude: "",
		longitude: "",
		directions: ""
	},
	announcements: { items: [{
		title: "Announcement",
		body: "Details…",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	}] },
	academics: {
		title: "Academics",
		body: "",
		programs: [{
			title: "Stage",
			description: "What it covers."
		}]
	},
	admissions_info: {
		title: "Admissions",
		body: "",
		deadline: "",
		steps: [{
			title: "Step",
			description: "What happens."
		}]
	},
	faculty: {
		title: "Our faculty",
		body: "",
		highlightStaffIds: []
	},
	mission_vision: {
		mission: "",
		vision: "",
		values: ["Curiosity", "Integrity"]
	},
	history: {
		title: "Our history",
		body: "",
		image: "",
		milestones: [{
			year: "2000",
			title: "Milestone"
		}]
	},
	auth_visual: {
		image: "/public/schools/everest/landing-footage/frame_0001.jpeg",
		eyebrow: "ScMS entrance",
		headline: "The digital entrance to the school.",
		subheadline: "One community / connected responsibly"
	},
	auth_intro: {
		kicker: "SCHOOL MANAGEMENT SYSTEM",
		title: "Welcome back.",
		intro: "Enter the credentials issued by your school to continue."
	},
	auth_form: {
		backLabel: "Public website",
		emailLabel: "Email",
		passwordLabel: "Password",
		forgotLabel: "Forgot password?",
		submitLabel: "Sign in",
		disclosure: "Frontend demonstration — no credentials are transmitted or stored."
	},
	auth_contact: {
		title: "Don't have access?",
		linkLabel: "Contact the school",
		linkHref: "/contact"
	},
	...SECTION_DEFAULTS
};
async function addBlock(key, type, _actor) {
	const page = await findPage(key);
	const defaults = BLOCK_LIBRARY_DEFAULTS[type];
	if (!defaults) throw new Error("Unknown block type");
	const maxOrder = page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;
	await prisma.contentBlock.create({ data: {
		type,
		label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
		visible: true,
		order: maxOrder + 1,
		fields: defaults,
		pageId: page.id
	} });
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function duplicateBlock(key, blockId, _actor) {
	const page = await findPage(key);
	const block = page.blocks.find((b) => b.id === blockId);
	if (!block) throw new Error("Block not found");
	const maxOrder = page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;
	await prisma.contentBlock.create({ data: {
		type: block.type,
		label: `${block.label} (copy)`,
		visible: block.visible,
		order: maxOrder + 1,
		fields: block.fields,
		pageId: page.id
	} });
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function deleteBlock(key, blockId, _actor) {
	const page = await findPage(key);
	if (!page.blocks.find((b) => b.id === blockId)) throw new Error("Block not found");
	await prisma.contentBlock.delete({ where: { id: blockId } });
	const remainingBlocks = page.blocks.filter((b) => b.id !== blockId);
	await prisma.$transaction(remainingBlocks.map((b, i) => prisma.contentBlock.update({
		where: { id: b.id },
		data: {
			order: i,
			updatedAt: /* @__PURE__ */ new Date()
		}
	})));
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function updatePageSeo(key, seo, actor) {
	await prisma.websitePage.update({
		where: { key },
		data: {
			seoTitle: seo.title,
			seoDescription: seo.description,
			seoKeywords: seo.keywords,
			updatedAt: /* @__PURE__ */ new Date(),
			updatedBy: actor.name,
			hasUnpublishedChanges: true
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function publishPage(key, actor) {
	await prisma.websitePage.update({
		where: { key },
		data: {
			status: "published",
			hasUnpublishedChanges: false,
			publishedAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date(),
			updatedBy: actor.name
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function unpublishPage(key, actor) {
	await prisma.websitePage.update({
		where: { key },
		data: {
			status: "draft",
			hasUnpublishedChanges: true,
			updatedAt: /* @__PURE__ */ new Date(),
			updatedBy: actor.name
		}
	});
	const updatedPage = await getWebsitePage(key);
	if (!updatedPage) throw new Error("Page not found after update");
	return updatedPage;
}
async function ensureDefaultPages() {
	for (const page of [
		{
			key: "faculty",
			title: "Faculty & Administration",
			path: "/faculty"
		},
		{
			key: "login",
			title: "Sign in",
			path: "/login"
		},
		{
			key: "activate",
			title: "Activate",
			path: "/_onboard/activate/"
		},
		{
			key: "home",
			title: "Home",
			path: "/"
		},
		{
			key: "about",
			title: "About",
			path: "/about"
		},
		{
			key: "courses",
			title: "Courses",
			path: "/courses"
		},
		{
			key: "facilities",
			title: "Facilities",
			path: "/facilities"
		},
		{
			key: "gallery",
			title: "Gallery",
			path: "/gallery"
		},
		{
			key: "calendar",
			title: "Calendar",
			path: "/calendar"
		},
		{
			key: "contact",
			title: "Contact",
			path: "/contact"
		},
		{
			key: "resources",
			title: "Resources",
			path: "/resources"
		},
		{
			key: "result",
			title: "Results",
			path: "/result"
		},
		{
			key: "transportation",
			title: "Transportation",
			path: "/transportation"
		},
		{
			key: "notices",
			title: "Notices",
			path: "/notices"
		},
		{
			key: "scholarship",
			title: "Scholarships",
			path: "/scholarship"
		}
	]) await prisma.websitePage.upsert({
		where: { key: page.key },
		update: { path: page.path },
		create: {
			key: page.key,
			title: page.title,
			path: page.path,
			status: "draft",
			hasUnpublishedChanges: true,
			seoTitle: "",
			seoDescription: "",
			seoKeywords: "",
			updatedBy: "system"
		}
	});
}
var Route$8 = createFileRoute("/api/website/pages")({ server: { handlers: { GET: async () => {
	try {
		await ensureDefaultPages();
		const pages = await listWebsitePages();
		return Response.json({ pages });
	} catch (error) {
		console.error("Failed to fetch website pages:", error);
		return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
	}
} } } });
var $$splitComponentImporter = () => import("./notices._id.edit-DEBuRkdg.mjs");
var Route$7 = createFileRoute("/admin/notices/$id/edit")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$6 = createFileRoute("/api/website/page/$key")({ server: { handlers: { GET: async ({ params }) => {
	try {
		const { key } = params;
		const page = await getPublishedPage(key);
		if (!page) return Response.json({ error: "Page not found" }, { status: 404 });
		return Response.json({ page });
	} catch (error) {
		console.error("Failed to fetch website page:", error);
		return Response.json({ error: "Failed to fetch page" }, { status: 500 });
	}
} } } });
/** Resolve a session from better-auth, falling back to the demo console cookie. */
async function resolveSession() {
	const headers = getRequestHeaders();
	try {
		const session = await auth.api.getSession({ headers });
		if (session?.user) return {
			user: {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				role: session.user.role || "staff",
				image: session.user.image
			},
			session: session.session
		};
	} catch {}
	const match = (headers.get("cookie") || "").match(/scms_demo_session=([^;]+)/);
	if (!match) return null;
	try {
		const decoded = JSON.parse(decodeURIComponent(match[1]));
		if (!decoded?.user) return null;
		const demoUser = decoded.user;
		return {
			user: {
				id: String(demoUser.id ?? "usr_demo"),
				name: String(demoUser.name ?? "Demo Admin"),
				email: String(demoUser.email ?? ""),
				role: String(demoUser.role ?? "admin"),
				image: typeof demoUser.image === "string" ? demoUser.image : void 0
			},
			session: {
				id: "demo-session-id",
				userId: String(demoUser.id ?? "usr_demo"),
				expiresAt: new Date(Date.now() + 864e5)
			}
		};
	} catch {
		return null;
	}
}
async function getCurrentUser(_request) {
	return (await resolveSession())?.user ?? null;
}
var Route$5 = createFileRoute("/api/website/pages/$key")({ server: { handlers: {
	GET: async ({ params }) => {
		try {
			const { key } = params;
			const page = await getWebsitePage(key);
			if (!page) return Response.json({ error: "Page not found" }, { status: 404 });
			return Response.json({ page });
		} catch (error) {
			console.error("Failed to fetch website page:", error);
			return Response.json({ error: "Failed to fetch page" }, { status: 500 });
		}
	},
	PATCH: async ({ params, request }) => {
		try {
			const user = await getCurrentUser(request);
			if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
			const { key } = params;
			const { seo, actor } = await request.json();
			const page = await updatePageSeo(key, seo, actor || {
				id: user.id,
				name: user.name,
				role: user.role
			});
			return Response.json({ page });
		} catch (error) {
			console.error("Failed to update page SEO:", error);
			return Response.json({ error: "Failed to update SEO" }, { status: 500 });
		}
	}
} } });
var Route$4 = createFileRoute("/api/website/pages/$key/blocks")({ server: { handlers: { POST: async ({ params, request }) => {
	try {
		const user = await getCurrentUser(request);
		if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const { key } = params;
		const { type, actor, orderedIds, blockId } = await request.json();
		const actorData = actor || {
			id: user.id,
			name: user.name,
			role: user.role
		};
		let page;
		if (type) page = await addBlock(key, type, actorData);
		else if (orderedIds) page = await reorderBlocks(key, orderedIds, actorData);
		else if (blockId) page = await duplicateBlock(key, blockId, actorData);
		else return Response.json({ error: "Invalid request" }, { status: 400 });
		return Response.json({ page });
	} catch (error) {
		console.error("Failed block operation:", error);
		return Response.json({ error: "Failed block operation" }, { status: 500 });
	}
} } } });
var Route$3 = createFileRoute("/api/website/pages/$key/publish")({ server: { handlers: { POST: async ({ params, request }) => {
	try {
		const user = await getCurrentUser(request);
		if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const { key } = params;
		const { actor } = await request.json();
		const page = await publishPage(key, actor || {
			id: user.id,
			name: user.name,
			role: user.role
		});
		return Response.json({ page });
	} catch (error) {
		console.error("Failed to publish page:", error);
		return Response.json({ error: "Failed to publish page" }, { status: 500 });
	}
} } } });
var Route$2 = createFileRoute("/api/website/pages/$key/unpublish")({ server: { handlers: { POST: async ({ params, request }) => {
	try {
		const user = await getCurrentUser(request);
		if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const { key } = params;
		const { actor } = await request.json();
		const page = await unpublishPage(key, actor || {
			id: user.id,
			name: user.name,
			role: user.role
		});
		return Response.json({ page });
	} catch (error) {
		console.error("Failed to unpublish page:", error);
		return Response.json({ error: "Failed to unpublish page" }, { status: 500 });
	}
} } } });
var Route$1 = createFileRoute("/api/website/pages/$key/blocks/$blockId")({ server: { handlers: {
	PATCH: async ({ params, request }) => {
		try {
			const user = await getCurrentUser(request);
			if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
			const { key, blockId } = params;
			const { fields, actor, direction, visibility } = await request.json();
			const actorData = actor || {
				id: user.id,
				name: user.name,
				role: user.role
			};
			let page;
			if (direction) page = await moveBlock(key, blockId, direction, actorData);
			else if (visibility !== void 0) page = await toggleBlockVisibility(key, blockId, actorData);
			else if (fields) page = await updateBlockFields(key, blockId, fields, actorData);
			else return Response.json({ error: "Invalid request" }, { status: 400 });
			return Response.json({ page });
		} catch (error) {
			console.error("Failed to update block:", error);
			return Response.json({ error: "Failed to update block" }, { status: 500 });
		}
	},
	DELETE: async ({ params, request }) => {
		try {
			const user = await getCurrentUser(request);
			if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
			const { key, blockId } = params;
			const { actor } = await request.json();
			const page = await deleteBlock(key, blockId, actor || {
				id: user.id,
				name: user.name,
				role: user.role
			});
			return Response.json({ page });
		} catch (error) {
			console.error("Failed to delete block:", error);
			return Response.json({ error: "Failed to delete block" }, { status: 500 });
		}
	}
} } });
var Route = createFileRoute("/api/website/pages/$key/sections/$sectionType")({ server: { handlers: { PATCH: async ({ params, request }) => {
	try {
		const user = await getCurrentUser(request);
		if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const { key, sectionType } = params;
		const { fields, actor } = await request.json();
		if (!fields) return Response.json({ error: "Invalid request" }, { status: 400 });
		const page = await saveSectionFields(key, sectionType, fields, actor || {
			id: user.id,
			name: user.name,
			role: user.role
		});
		return Response.json({ page });
	} catch (error) {
		console.error("Failed to update section:", error);
		return Response.json({ error: "Failed to update section" }, { status: 500 });
	}
} } } });
var OnboardRoute = Route$59.update({
	id: "/_onboard",
	getParentRoute: () => Route$60
});
var PublicRoute = Route$58.update({
	id: "/_public",
	getParentRoute: () => Route$60
});
var AdminRoute = Route$57.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$60
});
var LoginRoute = Route$56.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$60
});
var UserRoute = Route$55.update({
	id: "/user",
	path: "/user",
	getParentRoute: () => Route$60
});
var PublicIndexRoute = Route$54.update({
	id: "/",
	path: "/",
	getParentRoute: () => PublicRoute
});
var PublicAboutRoute = Route$53.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => PublicRoute
});
var PublicCalendarRoute = Route$52.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => PublicRoute
});
var PublicContactRoute = Route$51.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => PublicRoute
});
var PublicCourseFinderRoute = Route$50.update({
	id: "/course-finder",
	path: "/course-finder",
	getParentRoute: () => PublicRoute
});
var PublicCoursesRoute = Route$49.update({
	id: "/courses",
	path: "/courses",
	getParentRoute: () => PublicRoute
});
var PublicFacilitiesRoute = Route$48.update({
	id: "/facilities",
	path: "/facilities",
	getParentRoute: () => PublicRoute
});
var PublicFacultyRoute = Route$47.update({
	id: "/faculty",
	path: "/faculty",
	getParentRoute: () => PublicRoute
});
var PublicGalleryRoute = Route$46.update({
	id: "/gallery",
	path: "/gallery",
	getParentRoute: () => PublicRoute
});
var PublicNoticesRoute = Route$45.update({
	id: "/notices",
	path: "/notices",
	getParentRoute: () => PublicRoute
});
var PublicResourcesRoute = Route$44.update({
	id: "/resources",
	path: "/resources",
	getParentRoute: () => PublicRoute
});
var PublicResultRoute = Route$43.update({
	id: "/result",
	path: "/result",
	getParentRoute: () => PublicRoute
});
var PublicScholarshipRoute = Route$42.update({
	id: "/scholarship",
	path: "/scholarship",
	getParentRoute: () => PublicRoute
});
var PublicTransportationRoute = Route$41.update({
	id: "/transportation",
	path: "/transportation",
	getParentRoute: () => PublicRoute
});
var AdminIndexRoute = Route$40.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminSplatRoute = Route$39.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => AdminRoute
});
var AdminActivityRoute = Route$38.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => AdminRoute
});
var AdminAdmissionsRoute = Route$37.update({
	id: "/admissions",
	path: "/admissions",
	getParentRoute: () => AdminRoute
});
var AdminAttendanceRoute = Route$36.update({
	id: "/attendance",
	path: "/attendance",
	getParentRoute: () => AdminRoute
});
var AdminClassesRoute = Route$35.update({
	id: "/classes",
	path: "/classes",
	getParentRoute: () => AdminRoute
});
var AdminCoursesRoute = Route$34.update({
	id: "/courses",
	path: "/courses",
	getParentRoute: () => AdminRoute
});
var AdminEventsRoute = Route$33.update({
	id: "/events",
	path: "/events",
	getParentRoute: () => AdminRoute
});
var AdminGalleryRoute = Route$32.update({
	id: "/gallery",
	path: "/gallery",
	getParentRoute: () => AdminRoute
});
var AdminNoticesRoute = Route$31.update({
	id: "/notices",
	path: "/notices",
	getParentRoute: () => AdminRoute
});
var AdminOverviewRoute = Route$30.update({
	id: "/overview",
	path: "/overview",
	getParentRoute: () => AdminRoute
});
var AdminPaymentsRoute = Route$29.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => AdminRoute
});
var AdminScholarshipsRoute = Route$28.update({
	id: "/scholarships",
	path: "/scholarships",
	getParentRoute: () => AdminRoute
});
var AdminSettingsRoute = Route$27.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AdminRoute
});
var AdminStaffRoute = Route$26.update({
	id: "/staff",
	path: "/staff",
	getParentRoute: () => AdminRoute
});
var AdminStudentsRoute = Route$25.update({
	id: "/students",
	path: "/students",
	getParentRoute: () => AdminRoute
});
var AdminTransportationRoute = Route$24.update({
	id: "/transportation",
	path: "/transportation",
	getParentRoute: () => AdminRoute
});
var AdminUsersRoute = Route$23.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AdminRoute
});
var AdminWebsiteRoute = Route$22.update({
	id: "/website",
	path: "/website",
	getParentRoute: () => AdminRoute
});
var OnboardActivateIndexRoute = Route$21.update({
	id: "/activate/",
	path: "/activate/",
	getParentRoute: () => OnboardRoute
});
var OnboardActivateTokenRoute = Route$20.update({
	id: "/activate/$token",
	path: "/activate/$token",
	getParentRoute: () => OnboardRoute
});
var AdminAdmissionsIdRoute = Route$19.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminAdmissionsRoute
});
var AdminClassesIdRoute = Route$18.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminClassesRoute
});
var AdminCoursesIdRoute = Route$17.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminCoursesRoute
});
var AdminEventsIdRoute = Route$16.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminEventsRoute
});
var AdminGalleryIdRoute = Route$15.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminGalleryRoute
});
var AdminNoticesIdRoute = Route$14.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminNoticesRoute
});
var AdminNoticesNewRoute = Route$13.update({
	id: "/new",
	path: "/new",
	getParentRoute: () => AdminNoticesRoute
});
var AdminPaymentsIdRoute = Route$12.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminPaymentsRoute
});
var AdminStaffIdRoute = Route$11.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminStaffRoute
});
var AdminStudentsIdRoute = Route$10.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminStudentsRoute
});
var ApiAuthSplatRoute = Route$9.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$60
});
var ApiWebsitePagesRoute = Route$8.update({
	id: "/api/website/pages",
	path: "/api/website/pages",
	getParentRoute: () => Route$60
});
var AdminNoticesIdEditRoute = Route$7.update({
	id: "/edit",
	path: "/edit",
	getParentRoute: () => AdminNoticesIdRoute
});
var ApiWebsitePageKeyRoute = Route$6.update({
	id: "/api/website/page/$key",
	path: "/api/website/page/$key",
	getParentRoute: () => Route$60
});
var ApiWebsitePagesKeyRoute = Route$5.update({
	id: "/$key",
	path: "/$key",
	getParentRoute: () => ApiWebsitePagesRoute
});
var ApiWebsitePagesKeyBlocksRoute = Route$4.update({
	id: "/blocks",
	path: "/blocks",
	getParentRoute: () => ApiWebsitePagesKeyRoute
});
var ApiWebsitePagesKeyPublishRoute = Route$3.update({
	id: "/publish",
	path: "/publish",
	getParentRoute: () => ApiWebsitePagesKeyRoute
});
var ApiWebsitePagesKeyUnpublishRoute = Route$2.update({
	id: "/unpublish",
	path: "/unpublish",
	getParentRoute: () => ApiWebsitePagesKeyRoute
});
var ApiWebsitePagesKeyBlocksBlockIdRoute = Route$1.update({
	id: "/$blockId",
	path: "/$blockId",
	getParentRoute: () => ApiWebsitePagesKeyBlocksRoute
});
var ApiWebsitePagesKeySectionsSectionTypeRoute = Route.update({
	id: "/sections/$sectionType",
	path: "/sections/$sectionType",
	getParentRoute: () => ApiWebsitePagesKeyRoute
});
var OnboardRouteChildren = {
	OnboardActivateTokenRoute,
	OnboardActivateIndexRoute
};
var OnboardRouteWithChildren = OnboardRoute._addFileChildren(OnboardRouteChildren);
var PublicRouteChildren = {
	PublicAboutRoute,
	PublicCalendarRoute,
	PublicContactRoute,
	PublicCourseFinderRoute,
	PublicCoursesRoute,
	PublicFacilitiesRoute,
	PublicFacultyRoute,
	PublicGalleryRoute,
	PublicNoticesRoute,
	PublicResourcesRoute,
	PublicResultRoute,
	PublicScholarshipRoute,
	PublicTransportationRoute,
	PublicIndexRoute
};
var PublicRouteWithChildren = PublicRoute._addFileChildren(PublicRouteChildren);
var AdminAdmissionsRouteChildren = { AdminAdmissionsIdRoute };
var AdminAdmissionsRouteWithChildren = AdminAdmissionsRoute._addFileChildren(AdminAdmissionsRouteChildren);
var AdminClassesRouteChildren = { AdminClassesIdRoute };
var AdminClassesRouteWithChildren = AdminClassesRoute._addFileChildren(AdminClassesRouteChildren);
var AdminCoursesRouteChildren = { AdminCoursesIdRoute };
var AdminCoursesRouteWithChildren = AdminCoursesRoute._addFileChildren(AdminCoursesRouteChildren);
var AdminEventsRouteChildren = { AdminEventsIdRoute };
var AdminEventsRouteWithChildren = AdminEventsRoute._addFileChildren(AdminEventsRouteChildren);
var AdminGalleryRouteChildren = { AdminGalleryIdRoute };
var AdminGalleryRouteWithChildren = AdminGalleryRoute._addFileChildren(AdminGalleryRouteChildren);
var AdminNoticesIdRouteChildren = { AdminNoticesIdEditRoute };
var AdminNoticesRouteChildren = {
	AdminNoticesIdRoute: AdminNoticesIdRoute._addFileChildren(AdminNoticesIdRouteChildren),
	AdminNoticesNewRoute
};
var AdminNoticesRouteWithChildren = AdminNoticesRoute._addFileChildren(AdminNoticesRouteChildren);
var AdminPaymentsRouteChildren = { AdminPaymentsIdRoute };
var AdminPaymentsRouteWithChildren = AdminPaymentsRoute._addFileChildren(AdminPaymentsRouteChildren);
var AdminStaffRouteChildren = { AdminStaffIdRoute };
var AdminStaffRouteWithChildren = AdminStaffRoute._addFileChildren(AdminStaffRouteChildren);
var AdminStudentsRouteChildren = { AdminStudentsIdRoute };
var AdminRouteChildren = {
	AdminSplatRoute,
	AdminActivityRoute,
	AdminAdmissionsRoute: AdminAdmissionsRouteWithChildren,
	AdminAttendanceRoute,
	AdminClassesRoute: AdminClassesRouteWithChildren,
	AdminCoursesRoute: AdminCoursesRouteWithChildren,
	AdminEventsRoute: AdminEventsRouteWithChildren,
	AdminGalleryRoute: AdminGalleryRouteWithChildren,
	AdminNoticesRoute: AdminNoticesRouteWithChildren,
	AdminOverviewRoute,
	AdminPaymentsRoute: AdminPaymentsRouteWithChildren,
	AdminScholarshipsRoute,
	AdminSettingsRoute,
	AdminStaffRoute: AdminStaffRouteWithChildren,
	AdminStudentsRoute: AdminStudentsRoute._addFileChildren(AdminStudentsRouteChildren),
	AdminTransportationRoute,
	AdminUsersRoute,
	AdminWebsiteRoute,
	AdminIndexRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var ApiWebsitePagesKeyBlocksRouteChildren = { ApiWebsitePagesKeyBlocksBlockIdRoute };
var ApiWebsitePagesKeyRouteChildren = {
	ApiWebsitePagesKeyBlocksRoute: ApiWebsitePagesKeyBlocksRoute._addFileChildren(ApiWebsitePagesKeyBlocksRouteChildren),
	ApiWebsitePagesKeyPublishRoute,
	ApiWebsitePagesKeyUnpublishRoute,
	ApiWebsitePagesKeySectionsSectionTypeRoute
};
var ApiWebsitePagesRouteChildren = { ApiWebsitePagesKeyRoute: ApiWebsitePagesKeyRoute._addFileChildren(ApiWebsitePagesKeyRouteChildren) };
var rootRouteChildren = {
	OnboardRoute: OnboardRouteWithChildren,
	PublicRoute: PublicRouteWithChildren,
	AdminRoute: AdminRouteWithChildren,
	LoginRoute,
	UserRoute,
	ApiAuthSplatRoute,
	ApiWebsitePagesRoute: ApiWebsitePagesRoute._addFileChildren(ApiWebsitePagesRouteChildren),
	ApiWebsitePageKeyRoute
};
var routeTree = Route$60._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	const context = getContext();
	const router = createRouter({
		routeTree,
		context: {
			...context,
			session: null
		},
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient: context.queryClient
	});
	return router;
}
//#endregion
export { BLOCK_FIELDS, Button, Chip, CmsSectionBox, ERROR, Eyebrow, ImageReveal, Input, Label, PageFrame, PageHeader, PageShell, ROLE_DESCRIPTION, ROLE_LABEL, ROLE_PERMISSIONS, RailFill, Reveal, RevealUp, Route$20, Route$21, Route$41, Route$42, Route$43, Route$44, Route$45, Route$47, Route$48, Route$49, Route$51, Route$53, Route$54, STAGGER, Section, SectionHeading, SectionLabel, TRANSPORT_EMAIL, WidgetCaption, albums, authClient, createSsrRpc, duration, easing, getSectionFields, pageSectionTypes, photos, router_exports, school, sectionDefaults, sectionLabel, str, useAuth, useFacultyDirectory, useNotices, useScholarships, useWebsitePageContent };
