import { db } from "@/lib/db";
import { baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { ResumeSerivces } from "./utils";
import { TRPCError } from "@trpc/server";

export const resumeRouter = {
  addResume: baseProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        resumeContent: z.string().min(1, "resumeContent is required"),
      })
    )
    .mutation(async ({ input: { title, resumeContent } }) => {
      try {
        const resumeSerives = new ResumeSerivces({
          title,
          resumeContent,
        });

        const hash = resumeSerives.getHash();

        await db.resumeData.upsert({
          where: {
            hash: hash,
          },
          update: {},
          create: {
            hash,
            title,
            resumeContent,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  getResume: baseProcedure
    .input(
      z.object({
        resumeId: z.string(),
      })
    )
    .query(async ({ input: { resumeId } }) => {
      const resume = await db.resumeData.findUnique({
        where: {
          id: resumeId,
        },
      });

      return resume;
    }),
  getAllResumes: baseProcedure.query(async () => {
    const resumes = await db.resumeData.findMany();
    return resumes;
  }),
};
