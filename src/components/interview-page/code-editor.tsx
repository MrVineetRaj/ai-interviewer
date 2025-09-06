"use client";
import React from "react";
import Editor from "@monaco-editor/react";

interface Props {
  language: string;
  setUserCode: (code: string) => void;
  userCode: string;
}
export const CodeEditor = ({ language, setUserCode,userCode }: Props) => {
  return (
    <Editor
      height="90vh"
      language={language}
      value={userCode || "Write your code here..."}
      theme="vs-dark"
      options={{
        fontSize: 12,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        wrappingIndent: "indent",
        showFoldingControls: "always",
        folding: true,
        lineNumbers: "on",
        renderLineHighlight: "all",
        tabSize: 2,
        formatOnPaste: true,
        suggestOnTriggerCharacters: false, // disables autocomplete
        quickSuggestions: false, // disables inline suggestions
        parameterHints: { enabled: false }, // disables parameter hints
        hover: { enabled: false }, // disables hover
        codeLens: false, // disables code lens
        acceptSuggestionOnEnter: "off", // disables accepting suggestion on enter
        tabCompletion: "off", // disables tab completion
        suggest: { showWords: false }, // disables word suggestions
      }}
    />
  );
};
