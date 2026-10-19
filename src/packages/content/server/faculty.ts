import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/prisma";
import { requirePermission } from "#/packages/auth/server/guard.ts";

/**
 * Raw faculty rows for the admin directory editor. Unlike
 * `getFacultyMembersServer` (which maps rows to the public `Person` shape with
 * `id = slug`), this returns the database rows with their real `id` so edits
 * and deletes can target records reliably.
 */
export const prismaFacultyListServer = createServerFn({ method: "GET" })
	.middleware([requirePermission("staff.view")])
	.handler(async () => {
		const rows = await prisma.facultyMember.findMany({
			orderBy: [{ leadership: "desc" }, { rank: "asc" }, { order: "asc" }],
		});
		return rows.map((r) => ({
			id: r.id,
			slug: r.slug,
			name: r.name,
			role: r.role,
			department: r.department,
			qualification: r.qualification,
			experience: r.experience,
			subjects: Array.isArray(r.subjects) ? (r.subjects as string[]) : [],
			email: r.email,
			extension: r.extension,
			officeHours: r.officeHours,
			bio: r.bio,
			joined: r.joined,
			leadership: r.leadership,
			rank: r.rank,
			order: r.order,
		}));
	});
