-- Extend calendar_event so the public page can render Bikram Sambat dates
-- (the authored source of truth) alongside the stored Gregorian datetimes.
ALTER TABLE "calendar_event" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "calendar_event" ADD COLUMN IF NOT EXISTS "titleNe" TEXT;
ALTER TABLE "calendar_event" ADD COLUMN IF NOT EXISTS "startBs" TEXT;
ALTER TABLE "calendar_event" ADD COLUMN IF NOT EXISTS "endBs" TEXT;
ALTER TABLE "calendar_event" ADD COLUMN IF NOT EXISTS "kind" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "calendar_event_slug_key" ON "calendar_event"("slug");
