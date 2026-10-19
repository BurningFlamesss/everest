import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "#/packages/auth/server/guard.ts";
import { prisma } from "#/packages/db/index.ts";

/**
 * Data for the signed-in user's portal dashboard. Returns the user plus,
 * depending on their profile, either their Student record (with linked
 * guardians) or their Guardian record (with linked students).
 */
export const getMyPortalServer = createServerFn({ method: "GET" })
	.middleware([requireAuth])
	.handler(async ({ context }) => {
		const userId = (context as any).session.user.id as string;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true, email: true, image: true, activatedAt: true },
		});
		if (!user) throw new Error("User not found");

		const student = await prisma.student.findUnique({
			where: { userId },
			include: {
				guardianStudents: {
					include: { guardian: { include: { user: { select: { name: true, email: true } } } } },
				},
				guardianInvites: {
					where: { usedAt: null },
					orderBy: { createdAt: "desc" },
				},
			},
		});

		const guardian = await prisma.guardian.findUnique({
			where: { userId },
			include: {
				guardianStudents: {
					include: {
						student: {
							include: { user: { select: { name: true, email: true } } },
						},
					},
				},
			},
		});

		return {
			user,
			student: student
				? {
						id: student.id,
						grade: student.grade,
						section: student.section,
						admissionNo: student.admissionNo,
						status: student.status,
						guardians: student.guardianStudents.map((gs) => ({
							relation: gs.relation,
							name: gs.guardian.user.name,
							email: gs.guardian.user.email,
						})),
						pendingGuardianInvites: student.guardianInvites.map((gi) => ({
							id: gi.id,
							email: gi.guardianEmail,
							expiresAt: gi.expiresAt.toISOString(),
						})),
					}
				: null,
			guardian: guardian
				? {
						id: guardian.id,
						children: guardian.guardianStudents.map((gs) => ({
							relation: gs.relation,
							name: gs.student.user.name,
							email: gs.student.user.email,
							grade: gs.student.grade,
							section: gs.student.section,
						})),
					}
				: null,
		};
	});
