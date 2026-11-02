import { serverEnv } from '#/env/server.js';
import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const organization = await prisma.organization.upsert({
    where: {
      slug: serverEnv.ORGANIZATION_SLUG
    },
    update: {},
    create: {
      name: serverEnv.ORGANIZATION_NAME,
      slug: serverEnv.ORGANIZATION_SLUG
    }
  })

  const branch = await prisma.branch.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: serverEnv.DEFAULT_BRANCH_SLUG
      }
    },
    update: {},
    create: {
      name: serverEnv.DEFAULT_BRANCH_NAME,
      slug: serverEnv.DEFAULT_BRANCH_SLUG,
      organizationId: organization.id
    }
  })

  const user = await prisma.user.upsert({
    where: {
      email: serverEnv.SUPER_ADMIN_EMAIL
    },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: serverEnv.SUPER_ADMIN_NAME,
      email: serverEnv.SUPER_ADMIN_EMAIL,
      emailVerified: true
    }
  })

  await prisma.staff.upsert({
    where: {
      userId: user.id
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      branchId: branch.id,
      designation: "Super Administrator",
    }
  })

  await prisma.userRole.upsert({
    where: {
      userId_organizationId_role: {
        userId: user.id,
        organizationId: organization.id,
        role: "SUPERADMIN"
      }
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      branchId: branch.id,
      role: "SUPERADMIN"
    }
  })

  // The super admin should not receive a fresh invite on every seed run.
  const existingInvite = await prisma.invite.findFirst({
    where: { userId: user.id, usedAt: null },
  })

  const invite = existingInvite ?? await prisma.invite.create({
    data: {
			token: crypto.randomUUID(),
			userId: user.id,
			type: "STAFF",
			expiresAt: new Date(
				Date.now() + 1000 * 60 * 60 * 24 * 7,
			),
		},
  })

  // A small set of starter content so the public pages are never empty.
  await prisma.notice.upsert({
    where: { slug: "welcome-to-the-new-school-year" },
    update: {},
    create: {
      title: "Welcome to the new school year",
      slug: "welcome-to-the-new-school-year",
      summary:
        "The school office shares the key dates and reminders for the start of the academic session.",
      body:
        "Welcome back, everyone.\n\nClasses resume on the first working day of the new session. Students should arrive by 9:00 with their uniforms, notebooks and a completed emergency contact form.\n\nThe office will publish the full calendar, including examination dates and parent meetings, under Events. Please check the Notices page regularly for updates.",
      category: "General",
      audience: "ALL",
      isPublished: true,
      publishedAt: new Date(),
      organizationId: organization.id,
      branchId: branch.id,
      authorId: user.id,
    },
  })

  await prisma.event.upsert({
    where: { slug: "parent-teacher-meeting" },
    update: {},
    create: {
      title: "Parent–teacher meeting",
      slug: "parent-teacher-meeting",
      description:
        "A chance for guardians to meet class teachers and review the first term's progress.",
      location: "Main hall",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21 + 1000 * 60 * 60 * 3),
      isPublished: true,
      publishedAt: new Date(),
      organizationId: organization.id,
      branchId: branch.id,
      authorId: user.id,
    },
  })

  await prisma.club.upsert({
    where: { slug: "science-club" },
    update: {},
    create: {
      name: "Science Club",
      slug: "science-club",
      description:
        "Student-led experiments, science exhibitions and preparation for regional competitions.",
      meetingSchedule: "Fridays, 2:00 – 3:00",
      isActive: true,
      organizationId: organization.id,
      branchId: branch.id,
    },
  })

  console.log(`
    SUPER ADMIN created:
    
    EMAIL: ${user.email}

    ACTIVATION LINK: ${serverEnv.APP_URL}/activate/${invite.token}
    `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
