import { InterviewPage } from "@/components/interview-page";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const paramBody = await params;
  return (
    <div className="flex h-screen max-h-screen w-full max-w-screen bg-background p-4">
      <InterviewPage interviewId={paramBody.id} />
    </div>
  );
};

export default Page;
