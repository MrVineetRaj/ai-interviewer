import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { resumeRouter } from "@/modules/resume/procedure";
import { interviewRouter } from "@/modules/interview/procedure";
export const appRouter = createTRPCRouter({
  resumeRouter,
  interviewRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
