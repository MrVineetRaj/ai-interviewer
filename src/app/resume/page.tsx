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

const ResumePage = () => {
  const trpc = useTRPC();
  const { data: resumes, isPending: loadingResumes } = useQuery(
    trpc.resumeRouter.getAllResumes.queryOptions()
  );
  return (
    <div className="p-4 w-full flex flex-col h-screen ">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Resume Page</h1>
        <span className="flex gap-2 items-center">
          <Link href="/interview">
            <Button variant="outline">Manage Interview</Button>
          </Link>
          <AddResumeForm />
        </span>
      </div>
      {loadingResumes ? (
        <p>Loading...</p>
      ) : resumes && resumes.length > 0 ? (
        <div className="flex gap-4 flex-wrap items-center justify-start">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="border p-4 rounded-md shadow-md min-w-60 bg-card"
            >
              <h2 className="text-lg font-semibold mb-2">{resume.title}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              {/* <Link href={`/resume/${resume.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link> */}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center italic">
          No resumes found.
        </div>
      )}
    </div>
  );
};

export function AddResumeForm() {
  const [resumeTitle, setResumeTitle] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);

  const trpc = useTRPC();
  const addNewResume = useMutation(
    trpc.resumeRouter.addResume.mutationOptions()
  );
  async function handleSubjmit() {
    if (!resumeTitle || !resumeFile) return;
    console.log("Form Data:", {
      title: resumeTitle,
      file: resumeFile,
    });

    try {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Clone for text extraction
      const textPdf = new Uint8Array(uint8Array);

      // Clone for rendering
      // const renderPdf = new Uint8Array(uint8Array);

      const { text } = await extractText(await getDocumentProxy(textPdf), {
        mergePages: true,
      });

      await addNewResume.mutateAsync({
        title: resumeTitle,
        resumeContent: text,
      });
      setResumeTitle("");
      setResumeFile(null);
      window.location.reload();
    } catch (e: any) {
      console.log(e);
    }
  }
  return (
    <Dialog>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="default">New Resume</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Resume</DialogTitle>
            <DialogDescription>
              Add new resume for your Interviews here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="vineet_sde_2026"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="resume-file">Resume PDF</Label>
              <Input
                id="resume-file"
                name="resume-file"
                type="file"
                onChange={(e) => {
                  setResumeFile(e.target.files ? e.target.files[0] : null);
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
                handleSubjmit();
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
export default ResumePage;
