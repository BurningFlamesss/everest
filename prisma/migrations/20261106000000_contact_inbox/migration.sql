-- New admin domain: the public contact form's persisted inbox.
ALTER TYPE "PermissionKey" ADD VALUE IF NOT EXISTS 'MANAGE_INBOX';

CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'HANDLED');

CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "handledAt" TIMESTAMP(3),
    "handledById" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_handledById_fkey"
    FOREIGN KEY ("handledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
