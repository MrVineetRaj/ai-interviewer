import OpenAi from "openai";

class OpenAiServices {
  private openai: OpenAi;

  constructor() {
    this.openai = new OpenAi();
  }

  async getNextMessage({
    messages,
  }: {
    messages: {
      role: "assistant" | "developer" | "system" | "user";
      content: string;
    }[];
  }) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content;
  }
}

export const openAiServices = new OpenAiServices();
