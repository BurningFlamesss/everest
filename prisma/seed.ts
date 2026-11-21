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

  // Starter classes and rooms make the operational timetable usable on a
  // fresh database. Existing rows are matched by branch + name and kept.
  const starterClasses = [
    ...["Nursery", "LKG", "UKG"].map((grade) => ({ grade, section: "A" })),
    ...Array.from({ length: 10 }, (_, index) => ({
      grade: `Grade ${index + 1}`,
      section: "A",
    })),
    { grade: "Grade 11 · Science", section: "A" },
    { grade: "Grade 11 · Management", section: "A" },
    { grade: "Grade 12 · Science", section: "A" },
    { grade: "Grade 12 · Management", section: "A" },
  ];

  for (const [index, entry] of starterClasses.entries()) {
    const name = `${entry.grade} · ${entry.section}`;
    const existing = await prisma.schoolClass.findFirst({
      where: { branchId: branch.id, name },
      select: { id: true },
    });

    if (!existing) {
      await prisma.schoolClass.create({
        data: {
          branchId: branch.id,
          name,
          grade: entry.grade,
          section: entry.section,
          roomNo: String(101 + index),
          capacity: 40,
          academicYear: academicYear.name,
          order: index,
        },
      });
    }
  }

  const starterRooms = [
    "Room 101",
    "Room 102",
    "Room 103",
    "Room 104",
    "Room 105",
    "Science Lab",
    "Computer Lab",
    "Library",
  ];

  for (const name of starterRooms) {
    await prisma.classroom.upsert({
      where: { branchId_name: { branchId: branch.id, name } },
      update: {},
      create: {
        organizationId: organization.id,
        branchId: branch.id,
        name,
        building: "Main Block",
        capacity: 40,
        isActive: true,
      },
    });
  }

  // The subject catalogue used by Academics → Courses and the timetable.
  const starterSubjects = [
    { code: "ENG", name: "English" },
    { code: "NEP", name: "Nepali" },
    { code: "MAT", name: "Mathematics" },
    { code: "SCI", name: "Science" },
    { code: "SOC", name: "Social Studies" },
    { code: "CMP", name: "Computer Science" },
    { code: "HPE", name: "Health & Physical Education" },
    { code: "MOR", name: "Moral Education" },
    { code: "OPT-MAT", name: "Optional Mathematics" },
    { code: "PHY", name: "Physics" },
    { code: "CHE", name: "Chemistry" },
    { code: "BIO", name: "Biology" },
    { code: "ACC", name: "Accountancy" },
    { code: "ECO", name: "Economics" },
    { code: "BUS", name: "Business Studies" },
    { code: "BUS-MAT", name: "Business Mathematics" },
  ];

  for (const subject of starterSubjects) {
    await prisma.course.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: subject.code,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        branchId: branch.id,
        code: subject.code,
        name: subject.name,
        isActive: true,
      },
    });
  }

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

  // Seed Clubs, Club Roles, and Showcase Activity Posts
  await seedClubsAndActivities(organization.id, branch.id, user.id);

  // Seed Transportation Bus Routes with per-stop pricing & timings
  await seedBusRoutes();

  // Seed Timetable Slots for Homeroom Classes
  await seedTimetableSlots(academicYear.id, branch.id);

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

async function seedClubsAndActivities(organizationId: string, branchId: string, authorId: string) {
  console.log('🌱 Seeding clubs and activity posts...');

  const starterClubs = [
    {
      name: "Science & Innovation Club",
      slug: "science-club",
      description: "Student-led experiments, science exhibitions, astronomical observation, and regional STEM Olympiad training.",
      meetingSchedule: "Fridays, 2:00 – 3:30",
    },
    {
      name: "Robotics & IT Club",
      slug: "robotics-club",
      description: "Hardware tinkering, robotics engineering, microcontrollers, IoT workshops, and competitive coding.",
      meetingSchedule: "Wednesdays, 3:30 – 5:00",
    },
    {
      name: "Literature & Debate Society",
      slug: "literature-club",
      description: "Parliamentary debate, extempore speech, creative writing anthology, and oratory championships.",
      meetingSchedule: "Thursdays, 2:30 – 4:00",
    },
    {
      name: "Eco & Nature Conservation Club",
      slug: "eco-club",
      description: "Tree plantation drives, campus botanical surveys, waste segregation, and community environmental awareness.",
      meetingSchedule: "Tuesdays, 3:00 – 4:30",
    },
    {
      name: "Sports & Athletics Club",
      slug: "sports-club",
      description: "Inter-school tournaments, track & field events, basketball, football, cricket, and youth fitness coaching.",
      meetingSchedule: "Mon/Wed/Fri, 4:00 – 5:30",
    },
  ];

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
  ];

  const clubMap = new Map<string, string>();

  for (const clubData of starterClubs) {
    const club = await prisma.club.upsert({
      where: { slug: clubData.slug },
      update: {
        name: clubData.name,
        description: clubData.description,
        meetingSchedule: clubData.meetingSchedule,
      },
      create: {
        ...clubData,
        isActive: true,
        organizationId,
        branchId,
      },
    });

    clubMap.set(clubData.slug, club.id);

    for (const role of defaultRoles) {
      await prisma.clubRole.upsert({
        where: { clubId_name: { clubId: club.id, name: role.name } },
        update: {},
        create: { ...role, clubId: club.id },
      });
    }
  }

  const postsData = [
    {
      clubSlug: "sports-club",
      title: "Rupandehi District Inter-School Basketball Semi-Finals",
      category: "Sports",
      excerpt: "The Everest Boys Senior Basketball team clinched a thrilling 52-48 victory against Butwal Public School to secure their place in the tournament finals!",
      body: "<p>The Everest Boys Senior Basketball team clinched a thrilling <strong>52-48 victory</strong> against Butwal Public School yesterday evening in front of an electric home crowd, securing their place in the <em>Rupandehi District Inter-School Tournament Finals</em>!</p><p>Point guard <strong>Aayush Shrestha (Grade 11)</strong> led the fourth-quarter rally with 18 points, converting four crucial three-pointers in the final three minutes to overcome a six-point deficit.</p><p>The championship final is scheduled for this coming Saturday at 3:00 PM at the District Sports Complex. All students, parents, and alumni are invited to cheer our squad!</p>",
      isPinned: true,
    },
    {
      clubSlug: "literature-club",
      title: "Inter-House Extempore & Debate Championship Round 1",
      category: "Debate",
      excerpt: "Fierce and eloquent debate round conducted on the motion: 'Artificial intelligence will democratize quality education in South Asia'. Congratulations to all speakers!",
      body: "<p>The opening round of the annual <strong>Inter-House Extempore & Debate Championship</strong> saw fiery argumentation and meticulous cross-examinations in the Main Auditorium.</p><p>The house debated the motion: <em>'This House believes that generative artificial intelligence will democratize quality education across South Asia rather than widen regional disparities.'</em></p><p>Congratulations to <strong>Sagarmatha House</strong> for leading Round 1 scores, and best speaker honors awarded to <strong>Sneha Sharma (Grade 10 · A)</strong> for her compelling rebuttal on digital infrastructure access.</p>",
      isPinned: true,
    },
    {
      clubSlug: "robotics-club",
      title: "Autonomous Line-Follower Bot Workshop Complete",
      category: "Workshop",
      excerpt: "Hands-on session concluded yesterday where 8 junior teams assembled infrared sensor arrays and programmed PID control loops on Arduino Uno.",
      body: "<p>Yesterday's intensive 6-hour hands-on robotics session concluded with <strong>8 junior teams</strong> successfully assembling and calibrating infrared reflectance sensor arrays on Arduino Uno platforms.</p><p>Students implemented discrete PID feedback loops to navigate intricate track curves with variable line thicknesses. Top precision honors went to Team RoboTech (Grade 9) completing the course in 14.2 seconds!</p><p>Next week: Introduction to ultrasonic obstacle-avoidance algorithms and motor driver bridge circuitry.</p>",
      isPinned: true,
    },
    {
      clubSlug: "science-club",
      title: "Annual Science & Technology Expo 2083 Guidelines Released",
      category: "Exhibition",
      excerpt: "Detailed registration handbook, project safety criteria, and innovation categories now available for Grades 6 through 12.",
      body: "<p>The guidelines for the upcoming <strong>Everest Science & Technology Expo 2083</strong> are officially published. This year's central theme is <em>'Sustainable Engineering & Clean Energy for Rural Nepal'</em>.</p><p>Categories include Renewable Energy Systems, Agro-Technology Innovations, Environmental Bio-Chemistry, and Computational Modeling. Project submissions close next Friday at 4:00 PM.</p>",
      isPinned: false,
    },
    {
      clubSlug: "science-club",
      title: "Astronomy Night & Telescope Observation Recap",
      category: "Event",
      excerpt: "Over 140 students observed the rings of Saturn and lunar craters using our newly acquired 8-inch Dobsonian reflector.",
      body: "<p>Under crisp autumn skies, more than 140 students and faculty gathered on the main campus terrace for our inaugural <strong>Autumn Stargazing Night</strong>.</p><p>Attendees observed the Cassini division in Saturn's rings, four Galilean moons of Jupiter, and crater details across Mare Tranquillitatis through the club's 8-inch Dobsonian reflector telescope.</p>",
      isPinned: false,
    },
    {
      clubSlug: "eco-club",
      title: "Campus Botanical Inventory Project Launched",
      category: "Initiative",
      excerpt: "Student researchers have documented 42 distinct native flora species across the school grounds and tagged them with educational QR codes.",
      body: "<p>The Eco Club launched its comprehensive <strong>Campus Biodiversity Mapping Project</strong>. Over two weeks of fieldwork, student teams identified, catalogued, and indexed 42 native plant and tree species across our 4-acre premises.</p><p>Each specimen now displays a weatherproof QR placard linking visitors to botanical data, medicinal heritage, and ecological roles.</p>",
      isPinned: false,
    },
  ];

  for (const postData of postsData) {
    const clubId = clubMap.get(postData.clubSlug);
    if (!clubId) continue;

    const existing = await prisma.post.findFirst({
      where: { clubId, title: postData.title },
      select: { id: true },
    });

    if (!existing) {
      await prisma.post.create({
        data: {
          clubId,
          authorId,
          title: postData.title,
          excerpt: postData.excerpt,
          body: postData.body,
          category: postData.category,
          visibility: "PUBLIC",
          allowComments: true,
          isPinned: postData.isPinned,
        },
      });
    }
  }

  console.log(`  ✓ 5 clubs and ${postsData.length} showcase activity posts`);
}

async function seedBusRoutes() {
  console.log('🌱 Seeding transportation bus routes...');

  const routes = [
    {
      busNumber: "LU 1 KHA 4028",
      vehicleType: "Bus",
      capacity: 42,
      driverName: "Bhim Bahadur Thapa",
      driverPhone: "+977-9846021178",
      feeMonthly: 2100,
      order: 0,
      stops: [
        { name: "Traffic Chowk", pickupTime: "06:52", dropoffTime: "16:18", fare: 1800, landmark: "Butwal Bus Park" },
        { name: "Deepnagar", pickupTime: "06:57", dropoffTime: "16:13", fare: 1900, landmark: "Deepnagar Chowk" },
        { name: "Devinagar", pickupTime: "07:03", dropoffTime: "16:07", fare: 2000, landmark: "Devinagar Bazaar" },
        { name: "Sukkhanagar", pickupTime: "07:09", dropoffTime: "16:01", fare: 2100, landmark: "Sukkhanagar Chowk" },
        { name: "Tilottama", pickupTime: "07:15", dropoffTime: "15:55", fare: 2200, landmark: "Tilottama Bazaar" },
        { name: "Jitgadhi", pickupTime: "07:21", dropoffTime: "15:49", fare: 2300, landmark: "Jitgadhi Chowk" },
      ],
    },
    {
      busNumber: "LU 1 KHA 2290",
      vehicleType: "Bus",
      capacity: 45,
      driverName: "Tek Bahadur Gurung",
      driverPhone: "+977-9856034421",
      feeMonthly: 2400,
      order: 1,
      stops: [
        { name: "Manigram", pickupTime: "06:40", dropoffTime: "16:30", fare: 2200, landmark: "Manigram Chowk" },
        { name: "Sainamaina", pickupTime: "06:46", dropoffTime: "16:24", fare: 2300, landmark: "Sainamaina Bazaar" },
        { name: "Motipur", pickupTime: "06:52", dropoffTime: "16:18", fare: 2400, landmark: "Motipur Chowk" },
        { name: "Siddharthanagar", pickupTime: "06:59", dropoffTime: "16:11", fare: 2500, landmark: "Siddharthanagar Bus Stop" },
        { name: "Belahiya", pickupTime: "07:06", dropoffTime: "16:04", fare: 2600, landmark: "Sunauli Border" },
        { name: "Lumbini", pickupTime: "07:14", dropoffTime: "15:56", fare: 2800, landmark: "Lumbini Sanskritik" },
      ],
    },
    {
      busNumber: "BA 2 KHA 5512",
      vehicleType: "Van",
      capacity: 18,
      driverName: "Ram Prasad Sharma",
      driverPhone: "+977-9847055912",
      feeMonthly: 2600,
      order: 2,
      stops: [
        { name: "Golpark", pickupTime: "07:10", dropoffTime: "16:10", fare: 2000, landmark: "Golpark Traffic Island" },
        { name: "Puspalal Park", pickupTime: "07:20", dropoffTime: "16:00", fare: 2200, landmark: "Park Gate" },
        { name: "Drivertole", pickupTime: "07:30", dropoffTime: "15:50", fare: 2400, landmark: "Drivertole Chowk" },
        { name: "Yogikuti", pickupTime: "07:40", dropoffTime: "15:40", fare: 2600, landmark: "Yogikuti Overbridge" },
      ],
    },
  ];

  for (const route of routes) {
    const existing = await prisma.busRoute.findFirst({
      where: { busNumber: route.busNumber },
      select: { id: true },
    });

    if (existing) {
      await prisma.busRoute.update({
        where: { id: existing.id },
        data: {
          vehicleType: route.vehicleType,
          capacity: route.capacity,
          driverName: route.driverName,
          driverPhone: route.driverPhone,
          feeMonthly: route.feeMonthly,
          order: route.order,
          stops: route.stops,
        },
      });
    } else {
      await prisma.busRoute.create({
        data: {
          ...route,
          stops: route.stops,
        },
      });
    }
  }

  console.log(`  ✓ ${routes.length} transportation bus routes`);
}

async function seedTimetableSlots(academicYearId: string, branchId: string) {
  console.log('🌱 Seeding sample timetable slots...');

  const targetClass = await prisma.schoolClass.findFirst({
    where: { branchId, name: "Grade 10 · A" },
    select: { id: true },
  });

  if (!targetClass) return;

  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { id: true, code: true },
  });

  const courseMap = new Map(courses.map((c) => [c.code, c.id]));

  const room = await prisma.classroom.findFirst({
    where: { branchId, name: "Room 101" },
    select: { id: true },
  });

  const faculty = await prisma.facultyMember.findFirst({
    select: { id: true },
  });

  const periodDefs = [
    { periodIndex: 1, startsAt: "09:30", endsAt: "10:15", courseCode: "ENG" },
    { periodIndex: 2, startsAt: "10:15", endsAt: "11:00", courseCode: "MAT" },
    { periodIndex: 3, startsAt: "11:00", endsAt: "11:45", courseCode: "SCI" },
    { periodIndex: 4, startsAt: "11:45", endsAt: "12:30", courseCode: "NEP" },
    { periodIndex: 5, startsAt: "13:15", endsAt: "14:00", courseCode: "SOC" },
    { periodIndex: 6, startsAt: "14:00", endsAt: "14:45", courseCode: "CMP" },
    { periodIndex: 7, startsAt: "14:45", endsAt: "15:30", courseCode: "HPE" },
  ];

  // Weekdays 1 (Monday) through 5 (Friday)
  for (let weekday = 1; weekday <= 5; weekday++) {
    for (const period of periodDefs) {
      const courseId = courseMap.get(period.courseCode);
      if (!courseId) continue;

      const existing = await prisma.timetableSlot.findFirst({
        where: {
          academicYearId,
          classId: targetClass.id,
          weekday,
          periodIndex: period.periodIndex,
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.timetableSlot.create({
          data: {
            academicYearId,
            classId: targetClass.id,
            courseId,
            classroomId: room?.id ?? null,
            facultyMemberId: faculty?.id ?? null,
            weekday,
            periodIndex: period.periodIndex,
            startsAt: period.startsAt,
            endsAt: period.endsAt,
          },
        });
      }
    }
  }

  console.log(`  ✓ Sample timetable slots for Grade 10 · A (35 periods)`);
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
    const blockData = pageData.blocks.map((block, index) => ({
      type: block.type as BlockType,
      label: block.label,
      visible: block.visible,
      order: block.order ?? index,
      fields: block.fields as Record<string, string>,
    }));

    // Never overwrite a page an editor has already changed. On a fresh
    // database this creates the page and its saved CMS blocks exactly as the
    // school page currently looks.
    const page = await prisma.websitePage.upsert({
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
        publishedAt: pageData.status === "published" ? new Date() : null,
        blocks: { create: blockData },
      },
    });

    // Existing installs may predate the saved blocks in content.json. Fill
    // only an empty page so editor-created sections are never overwritten.
    if (blockData.length > 0) {
      const existingBlocks = await prisma.contentBlock.count({
        where: { pageId: page.id },
      });
      if (existingBlocks === 0) {
        await prisma.contentBlock.createMany({
          data: blockData.map((block) => ({ ...block, pageId: page.id })),
        });
      }
    }

    console.log(`  ✓ ${pageData.title} (${pageData.key})`);
  }
}

async function seedPublicCollections() {
  console.log('🌱 Seeding public content collections...');

  // Upsert by the stable slug/title keys rather than deleting the collections.
  // This keeps uploaded faculty portraits, edits, and timetable references
  // intact when the seed is run again on a live installation.
  for (const [index, person] of people.entries()) {
    await prisma.facultyMember.upsert({
      where: { slug: person.id },
      update: {},
      create: {
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
      },
    });
  }
  console.log(`  ✓ ${people.length} faculty members`);

  for (const [index, notice] of notices.entries()) {
    const existing = await prisma.notice.findFirst({
      where: { ref: notice.ref },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.notice.create({
      data: {
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
      },
    });
  }
  console.log(`  ✓ ${notices.length} notices`);

  for (const [index, scholarship] of scholarships.entries()) {
    const existing = await prisma.scholarship.findFirst({
      where: { ref: scholarship.ref },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.scholarship.create({
      data: {
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
      },
    });
  }
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