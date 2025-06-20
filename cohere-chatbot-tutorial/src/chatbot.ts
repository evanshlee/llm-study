import { CohereClientV2 } from "cohere-ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface ChatbotConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  preamble?: string;
  enableStreaming?: boolean;
}

export class CohereChatbot {
  private client: CohereClientV2;
  private config: ChatbotConfig;
  private conversationHistory: ChatMessage[] = [];

  constructor(apiKey: string, config: ChatbotConfig = {}) {
    this.client = new CohereClientV2({
      token: apiKey,
    });

    this.config = {
      model: "command-r-plus",
      temperature: 0.7,
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
