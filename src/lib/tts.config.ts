class TTSService {
  // private apiKey: string;

  constructor() {}

  // async speakOpenAI(text: string) {
  //   const response = await fetch("https://api.openai.com/v1/audio/speech", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${this.apiKey}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       model: "tts-1",
  //       voice: "nova", // Female voice
  //       input: text,
  //       speed: 0.9,
  //     }),
  //   });

  //   const audioBuffer = await response.arrayBuffer();
  //   const audio = new Audio();
  //   audio.src = URL.createObjectURL(
  //     new Blob([audioBuffer], { type: "audio/mpeg" })
  //   );
  //   audio.play();
  // }

  // Fallback to browser TTS
  speakBrowser(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    // const voices = speechSynthesis.getVoices();

    // console.log("voices", voices);
    // const femaleVoice = voices.find(
    //   (voice) =>
    //     voice.name.toLowerCase().includes("female") ||
    //     voice.name.includes("Samantha")
    // );

    // if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}

export const ttsServices = new TTSService();
