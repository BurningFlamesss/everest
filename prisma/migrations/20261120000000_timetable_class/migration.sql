-- Timetable slots belong to a homeroom class; the subject course is optional.
ALTER TABLE "TimetableSlot" ADD COLUMN "classId" TEXT;
ALTER TABLE "TimetableSlot" ALTER COLUMN "courseId" DROP NOT NULL;

CREATE INDEX "TimetableSlot_classId_weekday_idx" ON "TimetableSlot"("classId", "weekday");
CREATE UNIQUE INDEX "TimetableSlot_academicYearId_classId_weekday_periodIndex_key" ON "TimetableSlot"("academicYearId", "classId", "weekday", "periodIndex");

ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
