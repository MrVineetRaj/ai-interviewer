-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('pending', 'goingon', 'ended');

-- AlterTable
ALTER TABLE "public"."Interview" ADD COLUMN     "interviewStatus" "public"."InterviewStatus" NOT NULL DEFAULT 'pending';
