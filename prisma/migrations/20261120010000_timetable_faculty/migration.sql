ALTER TABLE "TimetableSlot" ADD COLUMN "facultyMemberId" TEXT;

CREATE INDEX "TimetableSlot_facultyMemberId_weekday_idx" ON "TimetableSlot"("facultyMemberId", "weekday");

ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_facultyMemberId_fkey" FOREIGN KEY ("facultyMemberId") REFERENCES "faculty_member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
