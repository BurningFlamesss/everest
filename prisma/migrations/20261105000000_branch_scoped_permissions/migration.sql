-- Add branch scoping to role defaults and per-user overrides.
ALTER TABLE "RolePermission" ADD COLUMN "branchId" TEXT;
ALTER TABLE "RolePermission" ADD COLUMN "scopeKey" TEXT NOT NULL DEFAULT 'global';

ALTER TABLE "UserPermission" ADD COLUMN "branchId" TEXT;
ALTER TABLE "UserPermission" ADD COLUMN "scopeKey" TEXT NOT NULL DEFAULT 'global';

-- Existing rows are global; replace the old uniqueness with scope-aware keys.
DROP INDEX "RolePermission_role_permission_key";
DROP INDEX "UserPermission_userId_permission_key";

CREATE UNIQUE INDEX "RolePermission_role_permission_scopeKey_key" ON "RolePermission"("role", "permission", "scopeKey");
CREATE UNIQUE INDEX "UserPermission_userId_permission_scopeKey_key" ON "UserPermission"("userId", "permission", "scopeKey");

CREATE INDEX "RolePermission_branchId_idx" ON "RolePermission"("branchId");
CREATE INDEX "UserPermission_branchId_idx" ON "UserPermission"("branchId");

ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
