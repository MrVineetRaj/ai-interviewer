import { InterviewStatus } from "@/generated/prisma";
import { db } from "@/lib/db";
import { openAiServices } from "@/lib/openai.config";
import { SYSTEM_PROMPT } from "@/lib/prompt";
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
      const currTime = new Date();
      let isInterviewEnded = false;
      const interview = await db.interview.findUnique({
        where: { id: interviewId },
        include: {
          resume: true,
        },
      });

      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

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
      } else {
        messages = [
          {
            role: "system",
            content: SYSTEM_PROMPT.get_system_prompt_for_user_response({
              resumeData: interview.resume.resumeContent,
              companyName: interview.companyName,
              coverletter: interview.coverLetter ? interview.coverLetter : "",
              jobDescription: interview.jobDescription,
              jobRole: interview.jobRole,
            }),
          },
        ];
      }

      const endTimeMs = interview?.endedAt
        ? interview.endedAt.getTime() - currTime.getTime()
        : interview.durationMs;
      messages.push({
        role: "user",
        content: userResponse,
      });

      messages.push({
        role: "system",
        content: `\nInterview will end in ${+endTimeMs / (60 * 1000)} mins`,
      });

      const resp = await openAiServices.getNextMessage({ messages });
      messages.push({
        role: "assistant",
        content: resp as string,
      });
      if (!interview.startedAt && !interview.endedAt) {
        await db.interview.update({
          where: {
            id: interviewId,
          },
          data: {
            messages: JSON.stringify(messages),
            startedAt: currTime,
            endedAt: new Date(currTime.getTime() + +interview.durationMs),
            interviewStatus: InterviewStatus.goingon,
          },
        });
      } else {
        if (interview.endedAt && interview.endedAt.getTime() < currTime.getTime()) {
          isInterviewEnded = true;
        }
        await db.interview.update({
          where: {
            id: interviewId,
          },
          data: {
            messages: JSON.stringify(messages),
            interviewStatus: isInterviewEnded
              ? InterviewStatus.ended
              : InterviewStatus.goingon,
          },
        });
      }

      return { isInterviewEnded, messages };
    }),
};
