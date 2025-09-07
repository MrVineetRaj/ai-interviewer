import { InterviewPage } from "@/components/interview-page";
import React from "react";

const Page = async ({ params }: { params: { id: string } }) => {
  return (
    <div className="flex h-screen max-h-screen w-full max-w-screen bg-background p-4">
      <InterviewPage interviewId={params.id} />
    </div>
  );
};

export default Page;
