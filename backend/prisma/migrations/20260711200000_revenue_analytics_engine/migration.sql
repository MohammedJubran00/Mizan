-- Enums
DO $$ BEGIN ALTER TYPE "InvoiceStatus" ADD VALUE 'REFUNDED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "BillingSource" ADD VALUE 'PROVIDER'; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "RevenueCategory" AS ENUM (
    'INVOICE_PAYMENT', 'MANUAL', 'CONSULTATION', 'COURT_FEE', 'RETAINER', 'SUBSCRIPTION', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingStatus" AS ENUM ('POSTED', 'PENDING', 'CANCELLED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "defaultCurrency" TEXT NOT NULL DEFAULT 'USD';

ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "category" "RevenueCategory" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "status" "BillingStatus" NOT NULL DEFAULT 'POSTED';
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "caseId" TEXT;
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "lawyerUserId" TEXT;

ALTER TABLE "manual_revenues" ADD COLUMN IF NOT EXISTS "category" "RevenueCategory" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "manual_revenues" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "manual_revenues" ADD COLUMN IF NOT EXISTS "caseId" TEXT;

-- Backfill categories / denormalized FKs from invoices
UPDATE "billings" b
SET
  "category" = 'INVOICE_PAYMENT',
  "clientId" = i."clientId",
  "caseId" = i."caseId",
  "lawyerUserId" = c."assignedToUserId"
FROM "invoices" i
LEFT JOIN "cases" c ON c."id" = i."caseId"
WHERE b."invoiceId" = i."id"
  AND b."source" = 'INVOICE';

UPDATE "billings"
SET "category" = 'MANUAL'
WHERE "source" = 'MANUAL' AND "category" = 'OTHER';

CREATE INDEX IF NOT EXISTS "billings_workspaceId_category_idx" ON "billings"("workspaceId", "category");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_status_idx" ON "billings"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_currency_idx" ON "billings"("workspaceId", "currency");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_clientId_idx" ON "billings"("workspaceId", "clientId");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_caseId_idx" ON "billings"("workspaceId", "caseId");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_lawyerUserId_idx" ON "billings"("workspaceId", "lawyerUserId");
CREATE INDEX IF NOT EXISTS "billings_workspaceId_status_occurredAt_idx" ON "billings"("workspaceId", "status", "occurredAt");
CREATE INDEX IF NOT EXISTS "billings_createdAt_idx" ON "billings"("createdAt");
CREATE INDEX IF NOT EXISTS "manual_revenues_workspaceId_category_idx" ON "manual_revenues"("workspaceId", "category");

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "billings" ADD CONSTRAINT "billings_lawyerUserId_fkey"
    FOREIGN KEY ("lawyerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "manual_revenues" ADD CONSTRAINT "manual_revenues_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "manual_revenues" ADD CONSTRAINT "manual_revenues_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
