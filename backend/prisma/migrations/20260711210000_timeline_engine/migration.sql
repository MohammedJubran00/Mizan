-- Hearing / deadline / activity timeline expansions
DO $$ BEGIN ALTER TYPE "HearingStatus" ADD VALUE 'RESCHEDULED'; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "HearingType" AS ENUM (
    'PRELIMINARY', 'TRIAL', 'MOTION', 'MEDIATION', 'ARBITRATION', 'STATUS_CONFERENCE', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DeadlineType" AS ENUM (
    'CASE', 'COURT', 'EVIDENCE', 'APPEAL', 'DOCUMENT', 'CONTRACT', 'INTERNAL', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DeadlineImportance" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ActivitySeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'CLIENT_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_DELETED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'HEARING_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'TASK_COMPLETED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'USER_INVITED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'USER_REMOVED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'THEME_CHANGED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'PROFILE_UPDATED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'LOGIN'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE "ActivityType" ADD VALUE 'LOGOUT'; EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "caseNumber" TEXT;

ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "hearingType" "HearingType" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "courtName" TEXT;
ALTER TABLE "hearings" ADD COLUMN IF NOT EXISTS "assignedLawyerId" TEXT;

ALTER TABLE "deadlines" ADD COLUMN IF NOT EXISTS "type" "DeadlineType" NOT NULL DEFAULT 'CASE';
ALTER TABLE "deadlines" ADD COLUMN IF NOT EXISTS "importance" "DeadlineImportance" NOT NULL DEFAULT 'MEDIUM';

ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "targetName" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "severity" "ActivitySeverity" NOT NULL DEFAULT 'INFO';
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX IF NOT EXISTS "hearings_workspaceId_hearingType_idx" ON "hearings"("workspaceId", "hearingType");
CREATE INDEX IF NOT EXISTS "hearings_assignedLawyerId_idx" ON "hearings"("assignedLawyerId");
CREATE INDEX IF NOT EXISTS "deadlines_workspaceId_type_idx" ON "deadlines"("workspaceId", "type");
CREATE INDEX IF NOT EXISTS "deadlines_workspaceId_importance_idx" ON "deadlines"("workspaceId", "importance");
CREATE INDEX IF NOT EXISTS "activities_workspaceId_type_createdAt_idx" ON "activities"("workspaceId", "type", "createdAt");
CREATE INDEX IF NOT EXISTS "cases_workspaceId_caseNumber_idx" ON "cases"("workspaceId", "caseNumber");

DO $$ BEGIN
  ALTER TABLE "hearings" ADD CONSTRAINT "hearings_assignedLawyerId_fkey"
    FOREIGN KEY ("assignedLawyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
