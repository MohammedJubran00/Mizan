-- CreateTable
CREATE TABLE "case_notes" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_notes_workspaceId_idx" ON "case_notes"("workspaceId");

-- CreateIndex
CREATE INDEX "case_notes_caseId_createdAt_idx" ON "case_notes"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "case_notes_authorId_idx" ON "case_notes"("authorId");

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
