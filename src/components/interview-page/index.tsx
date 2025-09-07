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
import { useQuery } from "@tanstack/react-query";

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
  const trpc = useTRPC();
  const { data: interviewData, isPending: loadingInterview } = useQuery(
    trpc.interviewRouter.getInterview.queryOptions({
      interviewId: interviewId,
    })
  );

  async function callbackFn(finalTranscript: string) {
    console.log("Final Transcript:", finalTranscript);
    setRecordAudio(false);
    setTranscript("");
    setIsRecording(false);
    setIsSending(true);
    console.log("Stop recording");
    // Simulate sending process
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setIsSending(false);
    setResponseArrived(true);

    console.log("Start recording");
  }

  async function restartRecording() {
    setRestartingRecording(true);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setRecordAudio(true);
    setResponseArrived(false);
    setRestartingRecording(false);
    console.log("Restart recording");
  }

  useEffect(() => {
    if (responseArrived) {
      restartRecording();
    }
  }, [responseArrived]);
  useEffect(() => {
    if (!transcript) {
      return;
    }
    setIsRecording(true);
    const timerRef = inactivityTimerRef.current;
    if (timerRef) clearTimeout(timerRef);

    inactivityTimerRef.current = setTimeout(() => {
      callbackFn(transcript);
    }, 5000); // 10 seconds

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [transcript]);

  return loadingInterview ? (
    <div className="flex w-full h-full items-center justify-center">
      Loading interview...
    </div>
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
          <ResizablePanel defaultSize={50}>
            <span className="border-b p-4 flex items-center justify-between">
              <Label>Interviewer</Label>
              <span className="text-right">
                {isSending && "Analyzing..."}
                {isRecording && "Recording..."}
                {responseArrived && "Restarting recording in 5s..."}
                {!isRecording && !isSending && !responseArrived && "Idle"}
              </span>
            </span>
            <div className="w-full h-full"></div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      <VoiceInterpreter
        // transcript={transcript}
        setTranscript={setTranscript}
        callbackFn={callbackFn}
        start={recordAudio}
        stop={!recordAudio}
      />
    </>
  );
};
