-- AlterEnum CaseStatus
DO $$ BEGIN
  ALTER TYPE "CaseStatus" ADD VALUE 'DRAFT';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "CaseStatus" ADD VALUE 'PENDING';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterEnum WorkspaceRole
DO $$ BEGIN
  ALTER TYPE "WorkspaceRole" ADD VALUE 'LAWYER';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "WorkspaceRole" ADD VALUE 'ASSISTANT';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum ClientStatus
DO $$ BEGIN
  CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum BillingSource
DO $$ BEGIN
  CREATE TYPE "BillingSource" AS ENUM ('INVOICE', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterEnum ActivityType
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'CASE_ASSIGNED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'REVENUE_ADDED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_UPLOADED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'DEADLINE_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'USER_CREATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'USER_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'ROLE_CHANGED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'WORKSPACE_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "assignedToUserId" TEXT;

CREATE TABLE IF NOT EXISTS "billings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" "BillingSource" NOT NULL,
    "invoiceId" TEXT,
    "manualRevenueId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "billings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "manual_revenues" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "manual_revenues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "billable_hour_entries" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "caseId" TEXT,
    "userId" TEXT,
    "hours" DECIMAL(12,2) NOT NULL,
    "workedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "billable_hour_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workspace_members_workspaceId_role_idx" ON "workspace_members"("workspaceId", "role");
CREATE INDEX IF NOT EXISTS "workspace_members_workspaceId_isActive_idx" ON "workspace_members"("workspaceId", "isActive");
CREATE INDEX IF NOT EXISTS "clients_workspaceId_status_idx" ON "clients"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "cases_workspaceId_assignedToUserId_idx" ON "cases"("workspaceId", "assignedToUserId");
CREATE INDEX IF NOT EXISTS "cases_assignedToUserId_idx" ON "cases"("assignedToUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "billings_invoiceId_key" ON "billings"("invoiceId");
CREATE UNIQUE INDEX IF NOT EXISTS "billings_manualRevenueId_key" ON "billings"("manualRevenueId");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_idx" ON "billings"("workspaceId");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_occurredAt_idx" ON "billings"("workspaceId", "occurredAt");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_source_idx" ON "billings"("workspaceId", "source");
CREATE INDEX IF NOT EXISTS "manual_revenues_workspaceId_idx" ON "manual_revenues"("workspaceId");
CREATE INDEX IF NOT EXISTS "manual_revenues_workspaceId_occurredAt_idx" ON "manual_revenues"("workspaceId", "occurredAt");
CREATE INDEX IF NOT EXISTS "billable_hour_entries_workspaceId_idx" ON "billable_hour_entries"("workspaceId");
CREATE INDEX IF NOT EXISTS "billable_hour_entries_workspaceId_workedAt_idx" ON "billable_hour_entries"("workspaceId", "workedAt");
CREATE INDEX IF NOT EXISTS "billable_hour_entries_caseId_idx" ON "billable_hour_entries"("caseId");
CREATE INDEX IF NOT EXISTS "billable_hour_entries_userId_idx" ON "billable_hour_entries"("userId");
CREATE INDEX IF NOT EXISTS "activities_workspaceId_type_idx" ON "activities"("workspaceId", "type");

DO $$ BEGIN
  ALTER TABLE "cases" ADD CONSTRAINT "cases_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_manualRevenueId_fkey" FOREIGN KEY ("manualRevenueId") REFERENCES "manual_revenues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "manual_revenues" ADD CONSTRAINT "manual_revenues_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "manual_revenues" ADD CONSTRAINT "manual_revenues_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billable_hour_entries" ADD CONSTRAINT "billable_hour_entries_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billable_hour_entries" ADD CONSTRAINT "billable_hour_entries_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billable_hour_entries" ADD CONSTRAINT "billable_hour_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Backfill Billing from existing PAID invoices
INSERT INTO "billings" (
  "id", "workspaceId", "amount", "currency", "source", "invoiceId",
  "manualRevenueId", "occurredAt", "description", "createdAt", "updatedAt"
)
SELECT
  md5(i."id" || '-billing'),
  i."workspaceId",
  i."amount",
  i."currency",
  'INVOICE'::"BillingSource",
  i."id",
  NULL,
  COALESCE(i."paidAt", i."issuedAt", i."createdAt"),
  'Backfilled from paid invoice',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "invoices" i
WHERE i."status" = 'PAID'
  AND NOT EXISTS (SELECT 1 FROM "billings" b WHERE b."invoiceId" = i."id");
