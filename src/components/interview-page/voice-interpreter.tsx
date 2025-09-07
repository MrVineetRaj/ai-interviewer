import React, { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface VoiceInterpreterProps {
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  callbackFn: (
    finalTranscript: string,
    userCode: string,
    language: string
  ) => void;
  start: boolean;
  stop: boolean;
  userCode: string;
  selectedLanguage: string;
  isInterviewEnded: boolean;
}

const SILENCE_TIMEOUT = 4000;
const FINAL_RESULT_DELAY = 1500;

const VoiceInterpreter: React.FC<VoiceInterpreterProps> = ({
  setTranscript,
  callbackFn,
  start,
  stop,
  userCode,
  selectedLanguage,
  isInterviewEnded,
}) => {
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalResultTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackCalledRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const isRecognizingRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const startPropRef = useRef(start);

  // Use refs to always get current values - this fixes the stale closure issue
  const userCodeRef = useRef(userCode);
  const selectedLanguageRef = useRef(selectedLanguage);
  const callbackFnRef = useRef(callbackFn);

  // Update refs when props change
  useEffect(() => {
    userCodeRef.current = userCode;
    console.log("VoiceInterpreter: userCode ref updated:", userCode);
  }, [userCode]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
    console.log(
      "VoiceInterpreter: selectedLanguage ref updated:",
      selectedLanguage
    );
  }, [selectedLanguage]);

  useEffect(() => {
    callbackFnRef.current = callbackFn;
  }, [callbackFn]);

  // This callback won't change when userCode/selectedLanguage changes
  const handleCallback = useCallback((transcript: string) => {
    if (!callbackCalledRef.current && transcript.trim()) {
      const currentUserCode = userCodeRef.current;
      const currentLanguage = selectedLanguageRef.current;

      callbackCalledRef.current = true;
      shouldRestartRef.current = false;
      callbackFnRef.current(
        transcript.trim(),
        currentUserCode,
        currentLanguage
      );
    }
  }, []); // No dependencies - uses refs for current values

  const clearAllTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (finalResultTimerRef.current) {
      clearTimeout(finalResultTimerRef.current);
      finalResultTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    shouldRestartRef.current = false;
    clearAllTimers();

    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("VoiceInterpreter: Failed to stop recognition:", error);
      }
    }
  }, [clearAllTimers]);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRecognizingRef.current) return;

    console.log("VoiceInterpreter: Starting recognition");
    callbackCalledRef.current = false;
    finalTranscriptRef.current = "";
    shouldRestartRef.current = true;
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.warn("VoiceInterpreter: Failed to start recognition:", error);
      if (
        error instanceof Error &&
        !error.message?.includes("already started")
      ) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (retryError) {
            console.log("VoiceInterpreter: Retry start failed:", retryError);
          }
        }, 1000);
      }
    }
  }, [setTranscript]);

  // This won't change when userCode/selectedLanguage changes
  const resetSilenceTimer = useCallback(() => {
    clearAllTimers();

    silenceTimerRef.current = setTimeout(() => {
      console.log("VoiceInterpreter: Silence timeout triggered");
      if (finalTranscriptRef.current.trim() && !callbackCalledRef.current) {
        handleCallback(finalTranscriptRef.current);
      }
    }, SILENCE_TIMEOUT);
  }, [handleCallback, clearAllTimers]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("VoiceInterpreter: Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("VoiceInterpreter: Recognition started");
      isRecognizingRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + " ";
          finalTranscriptRef.current += transcript + " ";
          console.log("VoiceInterpreter: Final result:", transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript || finalTranscript) {
        setTranscript(finalTranscriptRef.current + interimTranscript);
        resetSilenceTimer();
      }

      if (finalTranscript.trim()) {
        clearAllTimers();
        finalResultTimerRef.current = setTimeout(() => {
          console.log("VoiceInterpreter: Final result delay timeout");
          if (finalTranscriptRef.current.trim() && !callbackCalledRef.current) {
            handleCallback(finalTranscriptRef.current);
          }
        }, FINAL_RESULT_DELAY);
      }
    };

    recognition.onerror = (event: any) => {
      console.log("VoiceInterpreter: Recognition error:", event.error);
      isRecognizingRef.current = false;

      if (event.error === "not-allowed") {
        console.log("VoiceInterpreter: Microphone permission denied");
        return;
      }

      if (event.error === "no-speech") {
        console.log("VoiceInterpreter: No speech detected");
        shouldRestartRef.current = true;
        return;
      }

      if (event.error === "aborted") {
        console.log("VoiceInterpreter: Recognition aborted");
        return;
      }

      shouldRestartRef.current = true;
    };

    recognition.onend = () => {
      console.log("VoiceInterpreter: Recognition ended");
      isRecognizingRef.current = false;
      clearAllTimers();

      if (
        shouldRestartRef.current &&
        startPropRef.current &&
        !callbackCalledRef.current &&
        !isInterviewEnded
      ) {
        console.log("VoiceInterpreter: Auto-restarting recognition");
        setTimeout(() => {
          if (startPropRef.current && !isRecognizingRef.current) {
            startRecognition();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearAllTimers();
      shouldRestartRef.current = false;
      if (recognitionRef.current && isRecognizingRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn("VoiceInterpreter: Cleanup stop error:", error);
        }
      }
    };
  }, []); // Empty dependency array - only setup once

  useEffect(() => {
    startPropRef.current = start;

    console.log("VoiceInterpreter: Start/Stop changed:", { start, stop });

    // ✅ Don't start if interview is ended
    if (start && !stop && !isInterviewEnded) {
      startRecognition();
    } else {
      stopRecognition();
    }
  }, [start, stop, isInterviewEnded, startRecognition, stopRecognition]);
  useEffect(() => {
    if (isInterviewEnded) {
      console.log("VoiceInterpreter: Interview ended, stopping all recording");
      shouldRestartRef.current = false;
      stopRecognition();
      setTranscript(""); // Clear any remaining transcript
    }
  }, [isInterviewEnded, stopRecognition, setTranscript]);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return null;
};

export default VoiceInterpreter;
