"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractText, getDocumentProxy, renderPageAsImage } from "unpdf";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { ResumeData } from "@/generated/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const trpc = useTRPC();
  const { data: interviews, isPending: loadingInterviews } = useQuery(
    trpc.interviewRouter.getAllInterviewes.queryOptions()
  );
  return (
    <div className="p-4 w-full h-screen flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-between border-b mb-4">
        <h1 className="text-2xl font-bold mb-4">Interview Page</h1>
        <span className="flex gap-2 items-center">
          <Link href="/resume">
            <Button variant="outline">Manage Resumes</Button>
          </Link>
          <NewInterviewForm />
        </span>
      </div>
      {/* <div className="h-full"> */}
      {loadingInterviews ? (
        <div className="w-full h-full flex items-center justify-center italic">
          Loading Interviews...
        </div>
      ) : interviews && interviews.length > 0 ? (
        <div className="flex gap-4 flex-wrap items-start justify-start w-full h-full">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="border p-4 rounded-md shadow-md min-w-60 bg-card relative flex flex-col gap-4"
            >
              <Label className="text-muted-foreground">
                At {interview.companyName}
              </Label>
              <Badge className="absolute top-2 right-2">
                {interview?.messages ? "Ended" : "Pending"}
              </Badge>
              <h2 className="text-lg font-semibold ">{interview.jobRole}</h2>
              {interview.coverLetter && (
                <p className="text-sm italic line-clamp-3">
                  {"- Attached Cover Letter"}
                </p>
              )}
              {`- Resume: ${interview.resume?.title}`}
              <p className="text-sm text-gray-600 ">
                {new Date(interview.createdAt).toLocaleDateString()}
              </p>
              <Link href={`/interview/${interview.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center italic">
          No resumes found.
        </div>
      )}
    </div>
    // </div>
  );
};

export function NewInterviewForm() {
  // const [resumeTitle, setResumeTitle] = React.useState("");
  const [coverLetterFile, setCoverLetterFile] = React.useState<File | null>(
    null
  );
  const [companyName, setCompanyName] = React.useState("");
  const [jboRole, setJobRole] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [duration, setDuration] = React.useState<number>(15 * 60 * 1000);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");

  const trpc = useTRPC();

  const { data: availableResume, isPending: loadingResumes } = useQuery(
    trpc.resumeRouter.getAllResumes.queryOptions()
  );

  const addInterview = useMutation(
    trpc.interviewRouter.addInterview.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );

  async function handleSubmit() {
    if (!companyName || !jboRole || !jobDescription || !duration) return;

    let coverLetterContent: string = "";

    if (coverLetterFile) {
      try {
        const arrayBuffer = await coverLetterFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Clone for text extraction
        const textPdf = new Uint8Array(uint8Array);

        // Clone for rendering
        // const renderPdf = new Uint8Array(uint8Array);

        const { text } = await extractText(await getDocumentProxy(textPdf), {
          mergePages: true,
        });
        coverLetterContent = text;
        // await addNewResume.mutateAsync({
        //   title: resumeTitle,
        //   resumeContent: text,
        // });
        // setResumeTitle("");
        // setResumeFile(null);
        // window.location.reload();
      } catch (e: any) {
        console.log(e);
      }
    }

    await addInterview.mutateAsync({
      jobRole: jboRole,
      jobDescription,
      resumeId: selectedResumeId,
      durationMs: duration.toString(),
      companyName,
      coverLetterContent: coverLetterContent ? coverLetterContent : "",
    });
  }
  return (
    <Dialog>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="default">New Interview</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate new interview here</DialogTitle>
            <DialogDescription>
              Add new resume for your Interviews here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="resume">Resume</Label>
              {loadingResumes ? (
                <Skeleton className="w-full h-12" />
              ) : (
                <Select
                  onValueChange={(value) => {
                    setSelectedResumeId(value);
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    value={`${duration / (60 * 1000)}`}
                  >
                    {selectedResumeId && availableResume
                      ? availableResume.find(
                          (resume: ResumeData) => resume.id === selectedResumeId
                        )?.title
                      : "Select one resume"}
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto flex flex-col gap-4">
                    {availableResume && availableResume.length > 0 ? (
                      availableResume.map((resume: ResumeData) => (
                        <SelectItem
                          key={resume.id}
                          value={resume.id}
                          className="py-2 hover:bg-background px-2"
                        >
                          {resume.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="#" disabled>
                        No resumes found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="companyNAme">Company Name</Label>
              <Input
                id="companyNAme"
                name="companyNAme"
                placeholder="google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="job-role">Job Role</Label>
              <Input
                id="job-role"
                name="job-role"
                placeholder="Software Development Engineer"
                value={jboRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                name="job-description"
                placeholder="We are looking for a Software Development Engineer..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="max-h-32"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="duration">Duration (in minutes)</Label>
              <Select
                onValueChange={(value) => {
                  setDuration(+value * 60 * 1000);
                }}
              >
                <SelectTrigger
                  className="w-full"
                  value={`${duration / (60 * 1000)}`}
                >
                  {duration / (60 * 1000)} Mins
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto flex flex-col gap-4">
                  <SelectItem
                    value="10"
                    className="py-2 hover:bg-background px-2"
                  >
                    10 Mins
                  </SelectItem>
                  <SelectItem
                    value="15"
                    className="py-2 hover:bg-background px-2"
                  >
                    15 Mins
                  </SelectItem>
                  <SelectItem
                    value="30"
                    className="py-2 hover:bg-background px-2"
                  >
                    30 Mins
                  </SelectItem>
                  <SelectItem
                    value="45"
                    className="py-2 hover:bg-background px-2"
                  >
                    45 Mins
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="cover-letter-file">
                Cover Letter PDF {"(Optional)"}
              </Label>
              <Input
                id="cover-letter-file"
                name="cover-letter-file"
                type="file"
                onChange={(e) => {
                  setCoverLetterFile(e.target.files ? e.target.files[0] : null);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={() => {
                handleSubmit();
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default Page;
