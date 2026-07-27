-- AlterEnum: CaseStatus
ALTER TYPE "CaseStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "CaseStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';
ALTER TYPE "CaseStatus" ADD VALUE IF NOT EXISTS 'DISMISSED';
ALTER TYPE "CaseStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- AlterEnum: HearingStatus
ALTER TYPE "HearingStatus" ADD VALUE IF NOT EXISTS 'UPCOMING';
ALTER TYPE "HearingStatus" ADD VALUE IF NOT EXISTS 'CONCLUDED';

-- AlterEnum: HearingType
ALTER TYPE "HearingType" ADD VALUE IF NOT EXISTS 'INITIAL_SCHEDULING';
ALTER TYPE "HearingType" ADD VALUE IF NOT EXISTS 'SETTLEMENT_MEDIATION';
ALTER TYPE "HearingType" ADD VALUE IF NOT EXISTS 'DEPOSITION';
ALTER TYPE "HearingType" ADD VALUE IF NOT EXISTS 'SENTENCING';

-- AlterEnum: DeadlineStatus
ALTER TYPE "DeadlineStatus" ADD VALUE IF NOT EXISTS 'UPCOMING';

-- AlterEnum: ClientStatus
ALTER TYPE "ClientStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- CreateEnum: CasePriority
DO $$ BEGIN
  CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: HearingOutcome
DO $$ BEGIN
  CREATE TYPE "HearingOutcome" AS ENUM ('WON', 'SETTLED', 'LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: HearingNextAction
DO $$ BEGIN
  CREATE TYPE "HearingNextAction" AS ENUM ('FILE_MOTION', 'DRAFT_ORDER', 'NOTIFY_CLIENT', 'PREPARE_BRIEF', 'SCHEDULE_FOLLOW_UP', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: InvoiceTerms
DO $$ BEGIN
  CREATE TYPE "InvoiceTerms" AS ENUM ('DUE_ON_RECEIPT', 'NET_7', 'NET_14', 'NET_30', 'NET_60');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: PaymentMethod
DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK', 'ACH', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: clients
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "addressCountry" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "addressCity" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "addressStreet" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "addressPostalCode" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable: cases
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "court" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "judgeName" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "opposingParty" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "opposingCounsel" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "jurisdiction" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "filingDate" TIMESTAMP(3);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "filingDeadline" TIMESTAMP(3);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "discoveryDeadline" TIMESTAMP(3);
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "expectedClosingAt" TIMESTAMP(3);

-- AlterTable: hearings
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "room" TEXT;
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "judgeName" TEXT;
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "outcome" "HearingOutcome";
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "nextAction" "HearingNextAction";
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP(3);
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "transcriptUrl" TEXT;

-- AlterTable: deadlines
ALTER TABLE "deadlines" ADD COLUMN IF NOT EXISTS "note" TEXT;

-- AlterTable: workspace_members
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;

-- AlterTable: invoices
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "number" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "dueAt" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "terms" "InvoiceTerms" NOT NULL DEFAULT 'DUE_ON_RECEIPT';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "paymentInstructions" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "caseSummary" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "billingLawyerUserId" TEXT;

-- Backfill invoice numbers for any existing rows before unique constraint
UPDATE "invoices" SET "number" = 'INV-' || SUBSTRING("id" FROM 1 FOR 8) WHERE "number" IS NULL;
ALTER TABLE "invoices" ALTER COLUMN "number" SET NOT NULL;

-- AlterTable: billings
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod";
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "paymentReferenceNumber" TEXT;
ALTER TABLE "billings" ADD COLUMN IF NOT EXISTS "paymentNotes" TEXT;

-- CreateTable: case_members
CREATE TABLE IF NOT EXISTS "case_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "case_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable: invoice_line_items
CREATE TABLE IF NOT EXISTS "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "taxRate" DECIMAL(6,3) NOT NULL,
    "discountRate" DECIMAL(6,3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "case_members_workspaceId_idx" ON "case_members"("workspaceId");
CREATE INDEX IF NOT EXISTS "case_members_caseId_idx" ON "case_members"("caseId");
CREATE INDEX IF NOT EXISTS "case_members_userId_idx" ON "case_members"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "case_members_workspaceId_caseId_userId_key" ON "case_members"("workspaceId", "caseId", "userId");

CREATE INDEX IF NOT EXISTS "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");
CREATE INDEX IF NOT EXISTS "invoice_line_items_invoiceId_sortOrder_idx" ON "invoice_line_items"("invoiceId", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_workspaceId_number_key" ON "invoices"("workspaceId", "number");
CREATE INDEX IF NOT EXISTS "invoices_billingLawyerUserId_idx" ON "invoices"("billingLawyerUserId");

-- ForeignKeys (safe: ignore if already exist)
DO $$ BEGIN
  ALTER TABLE "case_members" ADD CONSTRAINT "case_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "case_members" ADD CONSTRAINT "case_members_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "case_members" ADD CONSTRAINT "case_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billingLawyerUserId_fkey" FOREIGN KEY ("billingLawyerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
