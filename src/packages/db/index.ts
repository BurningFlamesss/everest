// Canonical Prisma client lives in `#/lib/prisma` (used by all app/server code).
// This module re-exports it so both import paths resolve to the SAME instance,
// avoiding two connection pools (and two `globalThis` caches) against Postgres.
export { default, prisma } from "#/lib/prisma";
