-- Add the page-copy section block types used to make the landing, about and
-- contact pages editable in the fixed-section CMS without changing their design.
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'landing_hero';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'landing_facts';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'discover_cards';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'chapters';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'department_list';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'landing_section_headings';

-- WebsitePageKey backs a @unique column, so it cannot gain a value in place;
-- recreate-and-rename (same pattern as the academic_operations migration).
CREATE TYPE "WebsitePageKey_new" AS ENUM ('home', 'about', 'contact', 'other', 'faculty', 'login', 'activate', 'courses', 'facilities', 'gallery', 'calendar', 'resources', 'result', 'transportation', 'notices', 'scholarship', 'posts', 'course_finder');
ALTER TABLE "website_page" ALTER COLUMN "key" TYPE "WebsitePageKey_new" USING ("key"::text::"WebsitePageKey_new");
ALTER TYPE "WebsitePageKey" RENAME TO "WebsitePageKey_old";
ALTER TYPE "WebsitePageKey_new" RENAME TO "WebsitePageKey";
DROP TYPE "public"."WebsitePageKey_old";
