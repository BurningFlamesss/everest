-- Club joining: OPEN = join immediately, REQUEST = officer approval, CLOSED = no new members.
CREATE TYPE "ClubJoinPolicy" AS ENUM ('OPEN', 'REQUEST', 'CLOSED');
CREATE TYPE "ClubJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

ALTER TABLE "Club" ADD COLUMN "joinPolicy" "ClubJoinPolicy" NOT NULL DEFAULT 'REQUEST';

CREATE TABLE "ClubJoinRequest" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "ClubJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ClubJoinRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClubJoinRequest_clubId_studentId_key" ON "ClubJoinRequest"("clubId", "studentId");
CREATE INDEX "ClubJoinRequest_clubId_status_idx" ON "ClubJoinRequest"("clubId", "status");
CREATE INDEX "ClubJoinRequest_studentId_idx" ON "ClubJoinRequest"("studentId");

ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
