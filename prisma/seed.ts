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
      description: "Weekly practical laboratory investigations, winter science exhibition models, and mathematics Olympiad preparation.",
      meetingSchedule: "Fridays, 14:00 – 15:30 · Block B Science Lab",
    },
    {
      name: "Robotics & IT Club",
      slug: "robotics-club",
      description: "Practical computing, microcontroller circuit assembly, introductory programming, and computer laboratory maintenance.",
      meetingSchedule: "Fridays, 14:00 – 15:30 · Computer Lab 1",
    },
    {
      name: "Literature & Debate Society",
      slug: "literature-club",
      description: "Bilingual debate in Nepali and English, extempore speech, poetry recitation, and the annual school magazine editorial board.",
      meetingSchedule: "Fridays, 14:00 – 15:30 · Main Auditorium",
    },
    {
      name: "Eco & Nature Conservation Club",
      slug: "eco-club",
      description: "Campus tree planting, organic vegetable patch care, waste separation audits, and local environmental awareness.",
      meetingSchedule: "Tuesdays & Fridays, 15:45 – 16:45",
    },
    {
      name: "Sports & Athletics Club",
      slug: "sports-club",
      description: "Inter-house football, basketball league matches, morning track conditioning, and Rupandehi district tournament representation.",
      meetingSchedule: "Monday to Thursday, 06:30 – 07:30 & 16:00 – 17:30",
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
      title: "Inter-House Basketball League: Matchday 3 Results & Standings",
      category: "Athletics",
      excerpt: "Sagarmatha House and Machhapuchhre House take wins in the senior boys division. Semi-final court schedule posted for Friday.",
      body: "<p>The third round of senior boys inter-house basketball was played on the school court yesterday afternoon following period seven.</p><p>In the opening match, Sagarmatha House defeated Dhaulagiri House 38–31. Forward Aarav Poudel (Grade 10 · A) led scoring with 14 points, while Dhaulagiri maintained pressure under the rim with strong defensive rebounds in the third quarter.</p><p>The second fixture saw Machhapuchhre House defeat Annapurna House 42–36 after pulling ahead in the final five minutes.</p><p><strong>Semi-Final Fixtures (Friday, 28th Mangsir):</strong></p><ul><li><strong>03:00 PM:</strong> Sagarmatha House vs. Annapurna House</li><li><strong>04:00 PM:</strong> Machhapuchhre House vs. Dhaulagiri House</li></ul><p>Spectators from Grades 9 through 12 may watch from the east pavilion line. Normal Friday timetable applies through period six.</p>",
      isPinned: true,
    },
    {
      clubSlug: "literature-club",
      title: "Inter-House Extempore Speech Competition: Final Results",
      category: "Debate",
      excerpt: "Thirty-two pupils from junior and senior wings delivered three-minute speeches drawn at random. Department of Languages judges announce the house tally.",
      body: "<p>The annual Inter-House Extempore Speech Competition concluded yesterday in the Main Auditorium, organized by the Literature & Debate Society in coordination with the English and Nepali language faculties.</p><p>Pupils were given three minutes to prepare five-minute speeches on topics drawn from sealed envelopes. Speeches were judged on factual coherence, language accuracy, and delivery without notes.</p><p><strong>Senior Division Results (Grades 9–10):</strong></p><ul><li><strong>First Place:</strong> Sneha Sharma (Grade 10 · Sagarmatha House) — <em>\"Public transport priorities in Rupandehi\"</em></li><li><strong>Second Place:</strong> Rohan Shrestha (Grade 10 · Dhaulagiri House) — <em>\"Printed reference books vs. search engines in school libraries\"</em></li><li><strong>Third Place:</strong> Anisha Gurung (Grade 9 · Machhapuchhre House) — <em>\"Preserving vernacular dialects in urban centres\"</em></li></ul><p>The inter-house debate round on secondary curriculum reform will follow on the second Friday of Poush.</p>",
      isPinned: true,
    },
    {
      clubSlug: "robotics-club",
      title: "Computing Lab Session: Breadboard Prototyping & Sensor Logic",
      category: "Computing",
      excerpt: "Twelve student pairs in the junior wing assembled distance-measuring circuits and wrote threshold logic in C on Arduino Uno boards.",
      body: "<p>During Friday's society hours, students in the junior robotics wing completed their third hands-on exercise in embedded electronics in Computer Lab 1.</p><p>Working in pairs across twelve workstations, members assembled breadboard circuits using open-source microcontrollers, ultrasonic distance sensors, and dual-colour LEDs. The objective was to calibrate pulse-timing signals in C to detect proximity thresholds between 10 and 50 centimetres.</p><p>All groups verified their circuit connections and logged timing measurements in their club project files. The next session will introduce servo motor actuation and 5-volt power decoupling.</p>",
      isPinned: true,
    },
    {
      clubSlug: "science-club",
      title: "Winter Science Exhibition 2083: Model Registration & Guidelines",
      category: "Exhibition",
      excerpt: "The science faculty notice board now displays project categories, 1.2-metre bench allocations, and safety rules for working apparatus.",
      body: "<p>Guidelines for the upcoming Winter Science Exhibition are now posted on the Block B ground floor board. The exhibition gives students an opportunity to demonstrate experimental work completed during term practicals.</p><p><strong>Exhibition Divisions:</strong></p><ul><li><strong>Junior Secondary (Grades 6–8):</strong> Static structural models, biological specimen displays, and hydraulic fluid demonstrations.</li><li><strong>Secondary (Grades 9–10):</strong> Working models illustrating mechanical advantage, electromagnetic induction, or chemical reagent reactions.</li><li><strong>Senior Secondary (+2 Science):</strong> Experimental physics apparatus with verified error margins and documented laboratory record books.</li></ul><p>Ready-made commercial project kits are strictly prohibited; all assemblies must be fabricated from raw components. Project registration slips must be submitted to the science faculty office by Friday, 25th Mangsir.</p>",
      isPinned: false,
    },
    {
      clubSlug: "science-club",
      title: "Evening Terrace Astronomy Session: Planetary Observations",
      category: "Observatory",
      excerpt: "Clear winter skies over Butwal allowed forty senior physics students to observe Jupiter's Galilean satellites and lunar crater topography.",
      body: "<p>Forty students from Grade 11 and 12 physics gathered on the Block A third-floor terrace on Thursday evening from 6:30 to 8:30 PM for practical sky observation.</p><p>Using the department's 8-inch reflector telescope under clear skies, pupils observed the equatorial cloud bands of Jupiter, four Galilean moons (Io, Europa, Ganymede, Callisto), and crater structures along the lunar terminator.</p><p>Students sketched planetary features and computed angular magnification based on eyepiece focal lengths as part of their optics practical portfolio.</p>",
      isPinned: false,
    },
    {
      clubSlug: "eco-club",
      title: "Perimeter Tree Plantation & Paper Recycling Review",
      category: "Campus",
      excerpt: "Ten native saplings planted along the south boundary wall. Over 180 kg of scrap examination paper baled for the Butwal recycling centre.",
      body: "<p>During Friday co-curricular periods, Eco Club members completed the second phase of the campus boundary planting project.</p><p>Ten native neem and jacaranda saplings were planted along the southern fence behind the primary playground. Soil preparation and organic compost were coordinated with school grounds staff.</p><p>The club also finalized its bi-weekly paper audit: 184 kilograms of discarded print drafts and used assessment papers were sorted, tied, and handed over to the municipality-certified recycling depot in Butwal. Proceeds have been allocated for tree guards and watering equipment for the primary garden.</p>",
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

    if (existing) {
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          excerpt: postData.excerpt,
          body: postData.body,
          category: postData.category,
          isPinned: postData.isPinned,
        },
      });
    } else {
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
      email: serverEnv.SUPER_ADMIN_EMAIL,
      password: serverEnv.SUPER_ADMIN_PASSWORD,
      name: serverEnv.SUPER_ADMIN_NAME,
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