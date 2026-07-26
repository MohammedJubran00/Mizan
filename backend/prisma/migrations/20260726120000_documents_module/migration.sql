-- Documents module: PDF metadata store (binary content lives on disk)
DO $$ BEGIN
  CREATE TYPE "DocumentCategory" AS ENUM (
    'PLEADING', 'CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'INVOICE', 'REPORT', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "documents" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT,
  "clientId" TEXT,
  "uploadedById" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
  "fileName" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
  "sizeBytes" INTEGER NOT NULL,
  "checksum" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "documents_storageKey_key" ON "documents"("storageKey");
CREATE INDEX IF NOT EXISTS "documents_workspaceId_idx" ON "documents"("workspaceId");
CREATE INDEX IF NOT EXISTS "documents_workspaceId_createdAt_idx" ON "documents"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "documents_workspaceId_category_idx" ON "documents"("workspaceId", "category");
CREATE INDEX IF NOT EXISTS "documents_workspaceId_caseId_idx" ON "documents"("workspaceId", "caseId");
CREATE INDEX IF NOT EXISTS "documents_workspaceId_clientId_idx" ON "documents"("workspaceId", "clientId");
CREATE INDEX IF NOT EXISTS "documents_caseId_idx" ON "documents"("caseId");
CREATE INDEX IF NOT EXISTS "documents_clientId_idx" ON "documents"("clientId");
CREATE INDEX IF NOT EXISTS "documents_uploadedById_idx" ON "documents"("uploadedById");

DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
