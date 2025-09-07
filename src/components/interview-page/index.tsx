"use client";
import React, { useEffect, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "../ui/label";
import { CodeEditor } from "./code-editor";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Button } from "../ui/button";
import VoiceInterpreter from "./voice-interpreter";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { Loader, Mic2Icon, MicIcon } from "lucide-react";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import MarkdownRenderer from "../shared/markdown-renderer";
import { MessageContainer } from "../shared/message-container";
import { InterviewStatus } from "@/generated/prisma";
import { ttsServices } from "@/lib/tts.config";
import { Badge } from "../ui/badge";

export const InterviewPage = ({ interviewId }: { interviewId: string }) => {
  const SUPPORTED_LANGUAGES = ["cpp", "java", "python", "javascript"];
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("cpp");
  const [userCode, setUserCode] = React.useState<string>("");
  const [transcript, setTranscript] = React.useState<string>("");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [recordAudio, setRecordAudio] = React.useState<boolean>(false);
  const [responseArrived, setResponseArrived] = React.useState<boolean>(false);

  const [restartingRecording, setRestartingRecording] =
    React.useState<boolean>(false);
  const [isInterviewEnded, setIsInterviewEnded] =
    React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<
    {
      role: "user" | "assistant" | "system" | "developer";
      content: string;
    }[]
  >([]);
  const trpc = useTRPC();
  const { data: interviewData, isPending: loadingInterview } = useQuery(
    trpc.interviewRouter.getInterview.queryOptions({
      interviewId: interviewId,
    })
  );

  useEffect(() => {
    if (interviewData?.messages) {
      setMessages(JSON.parse(interviewData?.messages));
      if (interviewData?.interviewStatus === InterviewStatus.ended) {
        setRecordAudio(false);
        setIsRecording(false);
        setIsSending(false);
        setResponseArrived(false);
        setIsInterviewEnded(true);
      }
    }
  }, [loadingInterview]);
  const sendUserResponse = useMutation(
    trpc.interviewRouter.recordUserResponse.mutationOptions({
      onSuccess: (data) => {
        setMessages(data.messages);
        const assistantMessage = data.messages[data.messages.length - 1];
        if (assistantMessage.role === "assistant") {
          console.log(
            "Speaking out:",
            JSON.parse(assistantMessage.content).content
          );
          ttsServices.speakBrowser(
            JSON.parse(assistantMessage.content).content
          );
        }
        setIsInterviewEnded(data.isInterviewEnded);
        if (data.isInterviewEnded) {
          window.location.reload();
          setRecordAudio(false);
          setIsRecording(false);
          setIsSending(false);
          setResponseArrived(false);
        }
      },
    })
  );
  async function callbackFn(
    finalTranscript: string,
    userCode: string,
    language: string
  ) {
    console.log("Main: Current userCode:", userCode); // ✅ Log userCode separately

    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    setRecordAudio(false);
    setIsRecording(false);
    setIsSending(true);
    setTranscript(""); // Clear transcript immediately

    try {
      await sendUserResponse.mutateAsync({
        interviewId: interviewId,
        userResponse: JSON.stringify({
          voice: finalTranscript,
          code: userCode.replace("Write your code here...", "").trim(),
          language: userCode.replace("Write your code here...", "").trim()
            ? language
            : "",
        }),
      });
      setIsSending(false);
      setResponseArrived(true);
      console.log("Main: Response sent successfully");
    } catch (error) {
      console.error("Main: Error sending response:", error);
      setIsSending(false);
      setRecordAudio(true); // Restart recording on error
    }
  }

  // Fix 2: Simplify restart recording logic
  async function restartRecording() {
    if (isInterviewEnded || isSending) return;

    setRestartingRecording(true);
    setResponseArrived(false);

    // Force stop current recording
    setRecordAudio(false);
    setIsRecording(false);
    setTranscript("");

    // Wait for VoiceInterpreter to properly stop
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start fresh recording
    setRecordAudio(true);
    setRestartingRecording(false);
  }

  // Auto restart after response
  async function autoRestartRecording() {
    if (isInterviewEnded || isSending) return;

    setRestartingRecording(true);
    setResponseArrived(false);
    setTranscript("");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setRecordAudio(true);
    setRestartingRecording(false);
  }

  useEffect(() => {
    if (isInterviewEnded) {
      setRecordAudio(false);
      setIsRecording(false);
      setIsSending(false);
      setResponseArrived(false);
    }
    if (interviewData && !recordAudio && !restartingRecording) {
      setTimeout(() => {
        setRecordAudio(true);
      }, 1000);
    }
  }, [interviewData, isInterviewEnded, restartingRecording]);

  useEffect(() => {
    if (!transcript || transcript.trim() === "" || isSending) {
      return;
    }

    console.log("Transcript updated:", transcript);
    setIsRecording(true);

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set new timer with longer delay for better capture
    inactivityTimerRef.current = setTimeout(() => {
      console.log("Inactivity timer triggered");
      callbackFn(transcript, userCode, selectedLanguage);
    }, 2000); // Reduced from 5s for better responsiveness

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [transcript, isSending]); // Added isSending dependency

  useEffect(() => {
    if (responseArrived && !isInterviewEnded) {
      autoRestartRecording();
    }
  }, [responseArrived, isInterviewEnded]);

  return loadingInterview ? (
    <div className="flex w-full h-full items-center justify-center">
      Loading interview...
    </div>
  ) : interviewData?.interviewStatus === InterviewStatus.ended ? (
    <>Inter view Ended</>
  ) : (
    <>
      {interviewData && (
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg border md:min-w-[450px] bg-card"
        >
          <ResizablePanel defaultSize={50} className="flex gap-2 flex-col p-6">
            <span className="border-b pb-4 mb-2">
              <Label className="text-muted-foreground">Interviewing for</Label>
              <h1 className="font-bold text-2xl">
                {interviewData?.jobRole}, {interviewData?.companyName}
              </h1>
            </span>
            <span className="flex items-center gap-2 w-full justify-between">
              <Label>Code Editor</Label>
              <span className="flex items-center gap-2 ">
                <Select
                  onValueChange={setSelectedLanguage}
                  defaultValue={selectedLanguage}
                >
                  <SelectTrigger value={selectedLanguage} className="w-[150px]">
                    {selectedLanguage}
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* <Button>Send Code</Button> */}
                <Tooltip>
                  <TooltipTrigger onClick={() => restartRecording()}>
                    {!restartingRecording && (
                      <MicIcon
                        className={cn(
                          "size-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                        )}
                      />
                    )}
                    {restartingRecording && (
                      <Loader className="size-5 text-muted-foreground animate-spin cursor-not-allowed opacity-50" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent className=" px-4 py-2 text-sm text-muted-foreground rounded-md border bg-black">
                    Restart Recording
                  </TooltipContent>
                </Tooltip>
              </span>
            </span>
            <div className="w-full h-full">
              <CodeEditor
                language={selectedLanguage}
                setUserCode={setUserCode}
                userCode={userCode}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={50}
            className="flex flex-col h-full overflow-y-auto"
          >
            <span className="border-b p-4 flex items-center justify-between">
              <Label>Interviewer</Label>
              {isInterviewEnded ? (
                <Badge>Ended</Badge>
              ) : (
                <span className="text-right">
                  {isSending && "Analyzing..."}
                  {isRecording && "Recording..."}
                  {responseArrived && "Restarting recording in 5s..."}
                  {!isRecording && !isSending && !responseArrived && "Idle"}
                </span>
              )}
            </span>
            <MessageContainer messages={messages} />
            <div className="h-6"></div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      <VoiceInterpreter
        setTranscript={setTranscript}
        callbackFn={callbackFn}
        start={recordAudio}
        stop={!recordAudio}
        userCode={userCode}
        selectedLanguage={selectedLanguage}
        isInterviewEnded={isInterviewEnded}
      />
    </>
  );
};
