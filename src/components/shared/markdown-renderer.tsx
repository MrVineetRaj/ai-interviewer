"use client";
import React, { JSX, useState } from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CopyIcon } from "lucide-react";

interface MarkdownRendererProps {
  markdown?: string;
}

const CodeContainer = ({
  match,
  children,
}: {
  match: RegExpExecArray;
  children: React.ReactNode;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-start ">
      <span className="items-center flex justify-between w-full">
        <Badge className="" variant={"outline"}>
          {match[1]} Code
        </Badge>
        <Button
          size={"sm"}
          variant={"ghost"}
          onClick={() => {
            window.navigator.clipboard.writeText(
              String(children).replace(/\n$/, "")
            );
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          disabled={isCopied}
        >
          {isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
        </Button>
      </span>
      <SyntaxHighlighter
        PreTag="div"
        language={match[1]}
        style={atomDark}
        customStyle={{
          background: "transparent", // Let the parent div's bg show
          padding: "0", // 20px
          fontSize: "1rem",
          borderRadius: "0.75rem", // 12px
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

export default function MarkdownRenderer({
  markdown = "## Hello world \n```cpp\ncout>>'Hello World'\n```\n",
}: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
            const { children, className } = props;

            const match = /language-(\w+)/.exec(className + "  " || "");
            return match ? (
              <CodeContainer match={match}>{children}</CodeContainer>
            ) : (
              <code className={className}>{children}</code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
