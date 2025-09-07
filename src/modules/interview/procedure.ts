import { db } from "@/lib/db";
import { openAiServices } from "@/lib/openai.config";
import { baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const interviewRouter = {
  addInterview: baseProcedure
    .input(
      z.object({
        jobRole: z.string().min(1, "jobRole is required"),
        jobDescription: z.string().min(1, "jobDescription is required"),
        resumeId: z.string().min(1, "resumeId is required"),
        durationMs: z.string().min(1, "durationMs is required"),
        companyName: z.string().min(1, "companyName is required"),
        coverLetterContent: z.string().optional(),
      })
    )
    .mutation(
      async ({
        input: {
          jobDescription,
          jobRole,
          resumeId,
          durationMs,
          companyName,
          coverLetterContent,
        },
      }) => {
        try {
          await db.interview.create({
            data: {
              jobDescription,
              jobRole,
              resumeId,
              durationMs,
              companyName,
              coverLetter: coverLetterContent ? coverLetterContent : "",
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
      }
    ),

  getAllInterviewes: baseProcedure.query(async () => {
    const interviewes = await db.interview.findMany({
      include: {
        resume: true,
      },
    });
    return interviewes;
  }),
  getInterview: baseProcedure
    .input(
      z.object({
        interviewId: z.string(),
      })
    )
    .query(async ({ input: { interviewId } }) => {
      const interviewe = await db.interview.findUnique({
        where: {
          id: interviewId,
        },
      });

      return interviewe;
    }),
  recordUserResponse: baseProcedure
    .input(z.object({ interviewId: z.string(), userResponse: z.string() }))
    .mutation(async ({ input: { interviewId, userResponse } }) => {
      const interview = await db.interview.findUnique({
        where: { id: interviewId },
      });
      
      let messages: {
        role: "assistant" | "developer" | "system" | "user";
        content: string;
      }[] = [];

      if (interview?.messages) {
        const pastMessages: {
          role: "assistant" | "developer" | "system" | "user";
          content: string;
        }[] = JSON.parse(interview.messages);
        messages = pastMessages;
      }else{
        // load system prompt and resum plus cover later details here 
      }
      messages.push({
        role: "user",
        content: "userResponse",
      });

      const resp = openAiServices.getNextMessage({ messages });
    }),
};
