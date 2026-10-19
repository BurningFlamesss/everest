-- CreateEnum
CREATE TYPE "AttendancePersonType" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "AttendanceState" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WAITLISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID', 'OVERDUE', 'VOID');

-- AlterEnum
BEGIN;
CREATE TYPE "WebsitePageKey_new" AS ENUM ('home', 'about', 'contact', 'other', 'faculty', 'login', 'activate', 'courses', 'facilities', 'gallery', 'calendar', 'resources', 'result', 'transportation', 'notices', 'scholarship', 'posts');
ALTER TABLE "website_page" ALTER COLUMN "key" TYPE "WebsitePageKey_new" USING ("key"::text::"WebsitePageKey_new");
ALTER TYPE "WebsitePageKey" RENAME TO "WebsitePageKey_old";
ALTER TYPE "WebsitePageKey_new" RENAME TO "WebsitePageKey";
DROP TYPE "public"."WebsitePageKey_old";
COMMIT;

-- AlterTable
ALTER TABLE "GuardianInvite" ADD COLUMN     "guardianEmail" TEXT;

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "payload" JSONB;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "classId" TEXT;

-- CreateTable
CREATE TABLE "school_class" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "roomNo" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "academicYear" TEXT,
    "classTeacherId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_record" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "personType" "AttendancePersonType" NOT NULL,
    "state" "AttendanceState" NOT NULL,
    "note" TEXT,
    "studentId" TEXT,
    "staffId" TEXT,
    "classId" TEXT,
    "markedBy" TEXT NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "gradeApplied" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "guardianEmail" TEXT,
    "previousSchool" TEXT,
    "previousGrade" TEXT,
    "entranceScore" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "branchId" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "notes" JSONB NOT NULL DEFAULT '[]',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "convertedStudentId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "studentId" TEXT,
    "term" TEXT,
    "amount" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL DEFAULT '[]',
    "issuedDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT,
    "photos" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Campus',
    "block" TEXT NOT NULL DEFAULT '',
    "blurb" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "stats" JSONB NOT NULL DEFAULT '[]',
    "hours" TEXT NOT NULL DEFAULT '',
    "inCharge" TEXT NOT NULL DEFAULT '',
    "studentsLove" TEXT NOT NULL DEFAULT '',
    "since" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'PDF',
    "audience" TEXT NOT NULL DEFAULT 'All',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_result" (
    "id" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "appeared" INTEGER NOT NULL,
    "passed" INTEGER NOT NULL,
    "distinction" INTEGER NOT NULL,
    "firstDivision" INTEGER NOT NULL,
    "secondDivision" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_route" (
    "id" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "stops" JSONB NOT NULL,
    "feeMonthly" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bus_route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stream" TEXT,
    "duration" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "medium" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "careers" JSONB NOT NULL,
    "subjects" JSONB NOT NULL,
    "fees" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "routineKey" TEXT NOT NULL,
    "spotlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "term" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_class_branchId_idx" ON "school_class"("branchId");

-- CreateIndex
CREATE INDEX "school_class_grade_section_idx" ON "school_class"("grade", "section");

-- CreateIndex
CREATE INDEX "attendance_record_classId_date_idx" ON "attendance_record"("classId", "date");

-- CreateIndex
CREATE INDEX "attendance_record_studentId_date_idx" ON "attendance_record"("studentId", "date");

-- CreateIndex
CREATE INDEX "attendance_record_staffId_date_idx" ON "attendance_record"("staffId", "date");

-- CreateIndex
CREATE INDEX "attendance_record_date_idx" ON "attendance_record"("date");

-- CreateIndex
CREATE UNIQUE INDEX "application_applicationNo_key" ON "application"("applicationNo");

-- CreateIndex
CREATE INDEX "application_status_idx" ON "application"("status");

-- CreateIndex
CREATE INDEX "application_gradeApplied_idx" ON "application"("gradeApplied");

-- CreateIndex
CREATE INDEX "application_branchId_idx" ON "application"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNo_key" ON "invoice"("invoiceNo");

-- CreateIndex
CREATE INDEX "invoice_studentId_idx" ON "invoice"("studentId");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "album_category_idx" ON "album"("category");

-- CreateIndex
CREATE INDEX "album_year_idx" ON "album"("year");

-- CreateIndex
CREATE INDEX "resource_category_idx" ON "resource"("category");

-- CreateIndex
CREATE UNIQUE INDEX "board_result_board_year_key" ON "board_result"("board", "year");

-- CreateIndex
CREATE INDEX "calendar_event_startDate_idx" ON "calendar_event"("startDate");

-- CreateIndex
CREATE INDEX "calendar_event_category_idx" ON "calendar_event"("category");

-- CreateIndex
CREATE INDEX "Branch_organizationId_idx" ON "Branch"("organizationId");

-- CreateIndex
CREATE INDEX "Branch_slug_idx" ON "Branch"("slug");

-- CreateIndex
CREATE INDEX "GuardianInvite_studentId_idx" ON "GuardianInvite"("studentId");

-- CreateIndex
CREATE INDEX "GuardianInvite_expiresAt_idx" ON "GuardianInvite"("expiresAt");

-- CreateIndex
CREATE INDEX "Invite_userId_idx" ON "Invite"("userId");

-- CreateIndex
CREATE INDEX "Invite_expiresAt_idx" ON "Invite"("expiresAt");

-- CreateIndex
CREATE INDEX "Invite_type_idx" ON "Invite"("type");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Staff_branchId_status_idx" ON "Staff"("branchId", "status");

-- CreateIndex
CREATE INDEX "Staff_organizationId_status_idx" ON "Staff"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Staff_department_idx" ON "Staff"("department");

-- CreateIndex
CREATE INDEX "Staff_employeeId_idx" ON "Staff"("employeeId");

-- CreateIndex
CREATE INDEX "Student_branchId_status_idx" ON "Student"("branchId", "status");

-- CreateIndex
CREATE INDEX "Student_organizationId_status_idx" ON "Student"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Student_grade_section_idx" ON "Student"("grade", "section");

-- CreateIndex
CREATE INDEX "Student_admissionNo_idx" ON "Student"("admissionNo");

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- CreateIndex
CREATE INDEX "account_providerId_accountId_idx" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "content_block_pageId_visible_idx" ON "content_block"("pageId", "visible");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_emailVerified_idx" ON "user"("emailVerified");

-- CreateIndex
CREATE INDEX "user_activatedAt_idx" ON "user"("activatedAt");

-- CreateIndex
CREATE INDEX "website_page_status_idx" ON "website_page"("status");

-- CreateIndex
CREATE INDEX "website_page_path_idx" ON "website_page"("path");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_class" ADD CONSTRAINT "school_class_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_class" ADD CONSTRAINT "school_class_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

