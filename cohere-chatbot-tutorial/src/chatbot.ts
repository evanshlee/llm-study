import { CohereClientV2 } from "cohere-ai";

// A single message in the chat conversation
export interface ChatMessage {
  role: "user" | "assistant" | "system"; // Who sent this message
  content: string; // The text of the message
  timestamp?: Date; // When the message was sent
}

// Settings for how the chatbot should behave
export interface ChatbotConfig {
  model?: string; // Which AI model to use
  temperature?: number; // How creative the responses are (0-1)
  maxTokens?: number; // Maximum length of response
  preamble?: string; // Instructions for the AI's personality
  enableStreaming?: boolean; // Show response word by word
}

// Three preset styles for different use cases
export type ChatbotPreset = "precise" | "balanced" | "creative";

// Ready-made configurations for common scenarios
export const CHATBOT_PRESETS: Record<ChatbotPreset, ChatbotConfig> = {
  // For accurate answers (Q&A, summaries, technical docs)
  precise: {
    model: "command-r-plus",
    temperature: 0.0, // No creativity - same answer every time
    maxTokens: 500,
    preamble:
      "You are a helpful and precise assistant. Provide accurate and factual responses.",
    enableStreaming: false,
  },
  // For normal conversations (default choice)
  balanced: {
    model: "command-r-plus",
    temperature: 0.3, // Some creativity - recommended by Cohere docs
    maxTokens: 500,
    preamble: "You are a helpful assistant. Be informative and conversational.",
    enableStreaming: false,
  },
  // For creative tasks (poetry, brainstorming, storytelling)
  creative: {
    model: "command-r-plus",
    temperature: 1.0, // Maximum creativity - different answers each time
    maxTokens: 500,
    preamble:
      "You are a creative and imaginative assistant. Feel free to be expressive and think outside the box.",
    enableStreaming: false,
  },
};

// Main chatbot class - handles conversations with Cohere API
export class CohereChatbot {
  private client: CohereClientV2; // Connection to Cohere API
  private config: ChatbotConfig; // Current settings
  private conversationHistory: ChatMessage[] = []; // All messages so far

  // Create a new chatbot with custom settings
  constructor(apiKey: string, config: ChatbotConfig = {}) {
    // Set up connection to Cohere API
    this.client = new CohereClientV2({
      token: apiKey,
    });

    this.config = {
      model: "command-r-plus",
      temperature: 0.3,
      maxTokens: 500,
      enableStreaming: false,
      ...config,
    };

    // Add preamble to conversation history if provided
    if (this.config.preamble) {
      this.conversationHistory.push({
        role: "system",
        content: this.config.preamble,
        timestamp: new Date(),
      });
    }
  }

  public static fromPreset(
    apiKey: string,
    preset: ChatbotPreset,
  ): CohereChatbot {
    const presetConfig = CHATBOT_PRESETS[preset];
    return new CohereChatbot(apiKey, presetConfig);
  }

  public getPresetInfo(): string {
    const temp = this.config.temperature || 0.3;
    if (temp === 0.0) return "precise (focused on accuracy)";
    if (temp <= 0.3) return "balanced (general conversation)";
    if (temp >= 1.0) return "creative (imaginative responses)";
    return `custom (temperature: ${temp})`;
  }

  public async sendMessage(message: string): Promise<string> {
    // Add user message to history
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMessage);

    try {
      if (this.config.enableStreaming) {
        return await this.sendStreamingMessage();
      } else {
        return await this.sendRegularMessage();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to get response from Cohere API");
    }
  }

  private async sendRegularMessage(): Promise<string> {
    const response = await this.client.chat({
      model: this.config.model!,
      messages: this.formatMessagesForAPI(),
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    const assistantMessage =
      response.message?.content?.[0]?.text || "No response received";

    // Add assistant response to history
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
      timestamp: new Date(),
    });

    return assistantMessage;
  }

  private async sendStreamingMessage(): Promise<string> {
    const stream = await this.client.chatStream({
      model: this.config.model!,
      messages: this.formatMessagesForAPI(),
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk.type === "content-delta") {
        const deltaText = chunk.delta?.message?.content?.text || "";
        process.stdout.write(deltaText);
        fullResponse += deltaText;
      }
    }

    console.log(); // New line after streaming

    // Add assistant response to history
    this.conversationHistory.push({
      role: "assistant",
      content: fullResponse,
      timestamp: new Date(),
    });

    return fullResponse;
  }

  private formatMessagesForAPI() {
    return this.conversationHistory
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  public clearHistory(): void {
    this.conversationHistory = [];

    // Re-add preamble if it exists
    if (this.config.preamble) {
      this.conversationHistory.push({
        role: "system",
        content: this.config.preamble,
        timestamp: new Date(),
      });
    }
  }

  public setPreamble(preamble: string): void {
    this.config.preamble = preamble;

    // Remove existing preamble and add new one
    this.conversationHistory = this.conversationHistory.filter(
      (msg) => msg.role !== "system",
    );
    this.conversationHistory.unshift({
      role: "system",
      content: preamble,
      timestamp: new Date(),
    });
  }

  public getConfig(): ChatbotConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ChatbotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
