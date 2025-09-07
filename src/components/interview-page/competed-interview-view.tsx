"use client";
import { $Enums, Interview, ResumeData } from "@/generated/prisma";
import React from "react";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { MessageContainer } from "../shared/message-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import MarkdownRenderer from "../shared/markdown-renderer";

interface Props {
  interviewData: Interview & { resume: ResumeData };
}
const CompletedInterviewView = ({ interviewData }: Props) => {
  const trpc = useTRPC();
  const getInterviewFeedback = useMutation(
    trpc.interviewRouter.getInterviewFeedBack.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );
  const getResumeFeedback = useMutation(
    trpc.interviewRouter.getResumeFeedBack.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );
  return (
    <div className="-m-4 flex flex-col gap-4 max-h-[100svh] h-screen w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b w-full h-16">
        <Label>
          <h1 className="text-2xl font-bold">
            {interviewData?.jobRole}
            {",  "}
            <span className="text-muted-foreground">
              {interviewData?.companyName}
            </span>
          </h1>
        </Label>
      </div>
      <div className="flex gap-4 h-full w-full">
        <span className="flex-1 border-r h-full">
          <Label className="px-4 mb-4 text-lg pl-8 font-bold text-muted-foreground flex-1">
            Interview Chats
          </Label>
          <div
            className="max-h-[calc(100vh-8rem)] overflow-y-auto flex-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#888 transparent",
            }}
          >
            <MessageContainer
              messages={JSON.parse(interviewData?.messages as string)}
            />
          </div>
        </span>
        <div className="flex-1 w-full  h-[90vh] overflow-y-auto">
          <Tabs
            className="w-full flex flex-col h-full"
            defaultValue="interveiw-feedback"
          >
            <TabsList className="rounded-none w-full border-b">
              <TabsTrigger
                value="interveiw-feedback"
                className="w-full rounded-none"
              >
                Interview Feedback
              </TabsTrigger>
              <TabsTrigger
                value="resume-feedback"
                className="w-full rounded-none"
              >
                Resume Feedback
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="interveiw-feedback"
              className="p-4 flex flex-col h-full "
            >
              {!interviewData?.interviewFeedback && (
                <span className="flex flex-col items-center justify-center w-full h-full gap-4 ">
                  {getInterviewFeedback.isPending ? (
                    <span className="italic text-muted-foreground">
                      Generating feedback...
                    </span>
                  ) : (
                    <>
                      <span className="italic text-muted-foreground">
                        No feedback is generated
                      </span>
                      <Button
                        onClick={() => {
                          getInterviewFeedback.mutate({
                            interviewId: interviewData.id,
                          });
                        }}
                        disabled={
                          getInterviewFeedback.isPending ||
                          getResumeFeedback.isPending
                        }
                      >
                        Generate Feedback
                      </Button>
                    </>
                  )}
                </span>
              )}

              {interviewData?.interviewFeedback && (
                <MarkdownRenderer
                  markdown={
                    JSON.parse(interviewData?.interviewFeedback).feedback
                  }
                />
              )}
            </TabsContent>
            <TabsContent value="resume-feedback" className="p-4">
              {!interviewData?.resumeFeedback && (
                <span className="flex flex-col items-center justify-center w-full h-full gap-4 ">
                  {getResumeFeedback.isPending ? (
                    <span className="italic text-muted-foreground">
                      Generating
                    </span>
                  ) : (
                    <>
                      <span className="italic text-muted-foreground">
                        No feedback is generated
                      </span>
                      <Button
                        onClick={() => {
                          getResumeFeedback.mutate({
                            interviewId: interviewData.id,
                          });
                        }}
                        disabled={
                          getInterviewFeedback.isPending ||
                          getResumeFeedback.isPending
                        }
                      >
                        Generate Feedback
                      </Button>
                    </>
                  )}
                </span>
              )}
              {interviewData?.resumeFeedback && (
                <MarkdownRenderer
                  markdown={JSON.parse(interviewData?.resumeFeedback).feedback}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CompletedInterviewView;
