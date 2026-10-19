-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "qualification" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "guardianRelation" TEXT,
ADD COLUMN     "houseName" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "calendar_event" ADD COLUMN     "allDay" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "organizerName" TEXT,
ADD COLUMN     "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'scheduled';

-- CreateIndex
CREATE INDEX "calendar_event_status_idx" ON "calendar_event"("status");

