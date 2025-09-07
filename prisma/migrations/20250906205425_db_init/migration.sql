-- CreateTable
CREATE TABLE "public"."ResumeData" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "resumeContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Interview" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "durationMs" TEXT NOT NULL,
    "coverLetter" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "messages" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeData_hash_key" ON "public"."ResumeData"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeData_title_key" ON "public"."ResumeData"("title");

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "public"."ResumeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
