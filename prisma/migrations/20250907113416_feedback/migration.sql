/*
  Warnings:

  - You are about to drop the column `feedback` on the `Interview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Interview" DROP COLUMN "feedback",
ADD COLUMN     "interviewFeedback" TEXT,
ADD COLUMN     "resumeFeedback" TEXT;
