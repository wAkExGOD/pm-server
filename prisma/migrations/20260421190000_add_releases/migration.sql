CREATE TYPE "ReleaseStatus" AS ENUM ('UNRELEASED', 'RELEASED');

CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'UNRELEASED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Issue" ADD COLUMN "releaseId" INTEGER;

CREATE INDEX "Issue_projectId_releaseId_idx" ON "Issue"("projectId", "releaseId");
CREATE INDEX "Release_projectId_status_idx" ON "Release"("projectId", "status");
CREATE INDEX "Release_projectId_releaseDate_idx" ON "Release"("projectId", "releaseDate");

ALTER TABLE "Release" ADD CONSTRAINT "Release_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Release" ADD CONSTRAINT "Release_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;
