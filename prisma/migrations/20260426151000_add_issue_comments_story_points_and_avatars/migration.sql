ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT;

ALTER TABLE "Issue"
ADD COLUMN "storyPoints" INTEGER;

CREATE TABLE "IssueComment" (
  "id" SERIAL NOT NULL,
  "issueId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "IssueComment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "IssueComment"
ADD CONSTRAINT "IssueComment_issueId_fkey"
FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueComment"
ADD CONSTRAINT "IssueComment_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "IssueComment_issueId_createdAt_idx" ON "IssueComment"("issueId", "createdAt");
CREATE INDEX "IssueComment_authorId_idx" ON "IssueComment"("authorId");
