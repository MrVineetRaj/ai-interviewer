"use client";
import React, { useEffect, useRef } from "react";
import MarkdownRenderer from "./markdown-renderer";

export const MessageContainer = ({
  messages,
}: {
  messages: {
    role: "user" | "assistant" | "system" | "developer";
    content: string;
  }[];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="w-full h-full overflow-y-auto flex-grow">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p>No messages yet.</p>
          <p>Make sure is listner is listneing if not restart the listner.</p>
          <p>Start speaking to interact with the AI interviewer.</p>
        </div>
      )}
      <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map(
          (msg, index) =>
            msg?.role !== "system" &&
            (msg.role === "assistant" ? (
              <div className="prose flex flex-col gap-2" key={index}>
                <div className=" p-4 rounded-md flex max-w-none bg-secondary self-start">
                  <MarkdownRenderer
                    markdown={JSON.parse(msg.content).content}
                  />
                </div>

                {JSON.parse(msg.content).problem_statement && (
                  <div className="prose max-w-none p-4 rounded-md flex bg-secondary self-start">
                    <MarkdownRenderer
                      markdown={JSON.parse(msg.content).problem_statement}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                className="prose max-w-none bg-background  p-4  text-black self-end rounded-md flex"
                key={index}
              >
                <MarkdownRenderer markdown={JSON.parse(msg.content).voice} />
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
