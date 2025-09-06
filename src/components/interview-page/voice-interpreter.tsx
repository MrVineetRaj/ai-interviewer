import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface VoiceInterpreterProps {
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  callbackFn: (finalTranscript: string) => void;
  start: boolean;
  stop: boolean;
}

const SILENCE_TIMEOUT = 30000; // 30 seconds

const VoiceInterpreter: React.FC<VoiceInterpreterProps> = ({
  setTranscript,
  callbackFn,
  start,
  stop,
}) => {
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackCalledRef = useRef(false);
  const bufferRef = useRef(""); // Internal buffer
  const isRecognizingRef = useRef(false);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (!callbackCalledRef.current && bufferRef.current.trim()) {
          callbackFn(bufferRef.current.trim());
          callbackCalledRef.current = true;
          bufferRef.current = ""; // Clear buffer after callback
        }
      }, SILENCE_TIMEOUT);
    };

    recognition.onstart = () => {
      isRecognizingRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          bufferRef.current += result[0].transcript + " ";
          callbackCalledRef.current = false;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(bufferRef.current + interimTranscript);
      resetSilenceTimer();
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return; // Ignore aborted errors
      console.log("Speech recognition error", event);
      isRecognizingRef.current = false;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      // Only restart if we should continue listening
      if (!callbackCalledRef.current && start && !stop) {
        setTimeout(() => {
          if (recognitionRef.current && !isRecognizingRef.current) {
            recognitionRef.current.start();
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (isRecognizingRef.current && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    // eslint-disable-next-line
  }, [setTranscript, callbackFn]);

  useEffect(() => {
    console.log("Start/Stop changed:", start, stop);

    if (start && recognitionRef.current && !isRecognizingRef.current) {
      callbackCalledRef.current = false;
      bufferRef.current = ""; // Clear buffer on new start
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.warn("Failed to start recognition:", error);
      }
    }

    if (stop && recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("Failed to stop recognition:", error);
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
    // eslint-disable-next-line
  }, [start, stop]);

  return null;
};

export default VoiceInterpreter;
