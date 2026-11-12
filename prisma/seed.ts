import { config } from 'dotenv';
config({ path: '.env.local' });

import { serverEnv } from '#/env/server.js';
import { PrismaClient } from '../src/generated/prisma/client.js'

/**
 * Serialise a value for a Prisma `Json` column. Prisma's `InputJsonValue` does
 * not accept `undefined`, so absent fields are dropped rather than written as
 * a JSON `null`.
 */
function toJson<T>(value: T): T {
  return value === undefined ? (undefined as T) : JSON.parse(JSON.stringify(value));
}
import type { BlockType, Role, WebsitePageKey } from '../src/generated/prisma/enums.js'
import { people } from '#/lib/faculty';
import { notices } from '#/lib/notices';
import { scholarships } from '#/lib/scholarships';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { hashPassword } from '@better-auth/utils/password';

import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

interface ContentPage {
  key: string;
  title: string;
  path: string;
  status: string;
  hasUnpublishedChanges: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  blocks: Array<{
    type: string;
    label: string;
    visible: boolean;
    order: number;
    fields: Record<string, unknown>;
  }>;
}

interface ContentFile {
  sidebar: any;
  pages: Record<string, ContentPage>;
  login: any;
}

function loadContentFile(): ContentFile {
  const contentPath = join(__dirname, '..', 'src', 'schools', 'everest', 'content.json');
  const content = readFileSync(contentPath, 'utf-8');
  return JSON.parse(content);
}

function loadConfigFile(): any {
  const configPath = join(__dirname, '..', 'src', 'schools', 'everest', 'config.json');
  const config = readFileSync(configPath, 'utf-8');
  return JSON.parse(config);
}

async function main() {
  console.log('🌱 Seeding database...')

  // Load default content from JSON files
  const contentFile = loadContentFile();
  const configFile = loadConfigFile();

  const organization = await prisma.organization.upsert({
    where: {
      slug: serverEnv.ORGANIZATION_SLUG
    },
    update: {},
    create: {
      name: configFile.organization.name || serverEnv.ORGANIZATION_NAME,
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

  // A default academic calendar keeps timetable/exam/fee screens usable on a
  // fresh database. Existing years are never rewritten.
  const calendarYear = new Date().getUTCFullYear()
  const yearStartsOn = new Date(Date.UTC(calendarYear, 3, 1))
  const yearEndsOn = new Date(Date.UTC(calendarYear + 1, 2, 31))

  const academicYear = await prisma.academicYear.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: `${calendarYear}-${String(calendarYear + 1).slice(-2)}`
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: `${calendarYear}-${String(calendarYear + 1).slice(-2)}`,
      startsOn: yearStartsOn,
      endsOn: yearEndsOn,
      isActive: true
    }
  })

  await prisma.term.createMany({
    data: [
      {
        academicYearId: academicYear.id,
        name: 'Term 1',
        startsOn: yearStartsOn,
        endsOn: new Date(Date.UTC(calendarYear, 8, 30))
      },
      {
        academicYearId: academicYear.id,
        name: 'Term 2',
        startsOn: new Date(Date.UTC(calendarYear, 9, 1)),
        endsOn: yearEndsOn
      }
    ],
    skipDuplicates: true
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
  // Notices are public content with no unique key besides `id`, so this is a
  // delete-and-recreate rather than an upsert.
  await prisma.notice.deleteMany({ where: { ref: "STARTER/2083/001" } })
  await prisma.notice.create({
    data: {
      ref: "STARTER/2083/001",
      title: "Welcome to the new school year",
      summary:
        "The school office shares the key dates and reminders for the start of the academic session.",
      dateAd: new Date().toISOString().slice(0, 10),
      dateBs: "2083-01-01",
      audience: "All",
      issuedBy: "School Office",
      category: "General",
      body: [
        "Welcome back, everyone.",
        "Classes resume on the first working day of the new session. Students should arrive by 9:00 with their uniforms, notebooks and a completed emergency contact form.",
        "The office will publish the full calendar, including examination dates and parent meetings, under Events. Please check the Notices page regularly for updates.",
      ],
      attachments: [],
      order: 0,
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

  const scienceClub = await prisma.club.upsert({
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

  // Default role board. Permissions are comma-separated keys from
  // `src/packages/clubs/permissions.ts`; a plain Member has none and cannot
  // publish to the club feed. Admins can edit these under Content → Clubs → Roles.
  const defaultRoles = [
    {
      name: "President",
      description: "Leads the club and its feed.",
      permissions: "posts.create,posts.editAny,posts.pin,members.manage",
      isBoard: true,
      sortOrder: 0,
    },
    {
      name: "Vice President",
      description: "Supports the president and can publish.",
      permissions: "posts.create,posts.editAny",
      isBoard: true,
      sortOrder: 1,
    },
    {
      name: "Secretary",
      description: "Writes club updates.",
      permissions: "posts.create",
      isBoard: true,
      sortOrder: 2,
    },
    {
      name: "Member",
      description: "Belongs to the club; cannot publish posts.",
      permissions: "",
      isBoard: false,
      sortOrder: 3,
    },
  ]

  for (const role of defaultRoles) {
    await prisma.clubRole.upsert({
      where: { clubId_name: { clubId: scienceClub.id, name: role.name } },
      update: {},
      create: { ...role, clubId: scienceClub.id },
    })
  }

  console.log(`
    SUPER ADMIN created:
    
    EMAIL: ${user.email}

    ACTIVATION LINK: ${serverEnv.APP_URL}/activate/${invite.token}
    `)

  await seedTestUsers(organization.id, branch.id);

  // Seed default website pages from content.json
  await seedWebsitePages(user.id, user.name, contentFile.pages);

  // Seed the public content collections that drive the -page-detail routes
  await seedPublicCollections();
}

async function seedTestUsers(organizationId: string, branchId: string) {
  const testUsers: Array<{
    email: string;
    password: string;
    name: string;
    role: Role;
  }> = [
    {
      email: "admin@gmail.com",
      password: "everestadmin",
      name: "Admin",
      role: "SUPERADMIN",
    },
  ];

  for (const testUser of testUsers) {
    const hashedPassword = await hashPassword(testUser.password);
    
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: testUser.name,
        email: testUser.email,
        emailVerified: true,
      }
    });

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" }
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: hashedPassword,
        }
      });
    }

    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        organizationId,
        branchId,
        designation: testUser.role === "SUPERADMIN" ? "Super Administrator" : testUser.role === "ADMIN" ? "Administrator" : "Staff Member",
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_organizationId_role: {
          userId: user.id,
          organizationId,
          role: testUser.role,
        }
      },
      update: {},
      create: {
        userId: user.id,
        organizationId,
        branchId,
        role: testUser.role,
      }
    });

    console.log(`  ✓ Created test user: ${testUser.email} (${testUser.role})`);
  }
}

async function seedWebsitePages(_authorId: string, authorName: string, pages: Record<string, ContentPage>) {
  console.log('🌱 Seeding website pages from content.json...');

  for (const pageData of Object.values(pages)) {
    const key = pageData.key as WebsitePageKey;
    await prisma.websitePage.upsert({
      where: { key },
      update: {},
      create: {
        key,
        title: pageData.title,
        path: pageData.path,
        status: pageData.status as "draft" | "published",
        hasUnpublishedChanges: pageData.hasUnpublishedChanges,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        seoKeywords: pageData.seoKeywords,
        updatedBy: authorName,
        blocks: {
          create: pageData.blocks.map((block, index) => ({
            type: block.type as BlockType,
            label: block.label,
            visible: block.visible,
            order: block.order ?? index,
            fields: block.fields as Record<string, string>,
          })),
        },
      },
    });

    if (pageData.status === "published") {
      await prisma.websitePage.update({
        where: { key },
        data: { publishedAt: new Date() },
      });
    }

    console.log(`  ✓ ${pageData.title} (${pageData.key})`);
  }
}

async function seedPublicCollections() {
  console.log('🌱 Seeding public content collections...');

  await prisma.facultyMember.deleteMany({});
  await prisma.facultyMember.createMany({
    data: people.map((person, index) => ({
      slug: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      qualification: person.qualification,
      experience: person.experience,
      subjects: person.subjects,
      email: person.email,
      extension: person.extension,
      officeHours: person.officeHours,
      bio: person.bio,
      joined: person.joined,
      leadership: Boolean(person.leadership),
      rank: person.rank ?? null,
      order: index,
    })),
  });
  console.log(`  ✓ ${people.length} faculty members`);

  await prisma.notice.deleteMany({});
  await prisma.notice.createMany({
    data: notices.map((notice, index) => ({
      ref: notice.ref,
      title: notice.title,
      category: notice.category,
      dateAd: notice.dateAd,
      dateBs: notice.dateBs,
      audience: notice.audience,
      issuedBy: notice.issuedBy,
      summary: notice.summary,
      body: toJson(notice.body) as never,
      bullets: toJson(notice.bullets) as never,
      table: toJson(notice.table) as never,
      attachments: toJson(notice.attachments) as never,
      pinned: Boolean(notice.pinned),
      order: index,
    })),
  });
  console.log(`  ✓ ${notices.length} notices`);

  await prisma.scholarship.deleteMany({});
  await prisma.scholarship.createMany({
    data: scholarships.map((scholarship, index) => ({
      ref: scholarship.ref,
      name: scholarship.name,
      nepaliName: scholarship.nepaliName,
      category: scholarship.category,
      coverage: scholarship.coverage,
      award: scholarship.award,
      amountNpr: scholarship.amountNpr,
      seats: scholarship.seats,
      deadlineAd: scholarship.deadlineAd,
      deadlineBs: scholarship.deadlineBs,
      appliesTo: scholarship.appliesTo,
      summary: scholarship.summary,
      description: scholarship.description,
      eligibility: toJson(scholarship.eligibility) as never,
      benefits: toJson(scholarship.benefits) as never,
      documents: toJson(scholarship.documents) as never,
      process: toJson(scholarship.process) as never,
      renewal: scholarship.renewal,
      contact: scholarship.contact,
      spotlight: Boolean(scholarship.spotlight),
      order: index,
    })),
  });
  console.log(`  ✓ ${scholarships.length} scholarships`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })