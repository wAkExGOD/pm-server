CREATE TYPE "IssueType" AS ENUM ('BUG', 'TASK', 'STORY');
CREATE TYPE "IssuePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "IssueStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "IssueType" NOT NULL,
    "priority" "IssuePriority" NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'TODO',
    "assigneeId" INTEGER,
    "reporterId" INTEGER NOT NULL,
    "sprintId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Issue_projectId_sprintId_idx" ON "Issue"("projectId", "sprintId");
CREATE INDEX "Issue_projectId_status_idx" ON "Issue"("projectId", "status");
CREATE INDEX "Issue_projectId_priority_idx" ON "Issue"("projectId", "priority");

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
