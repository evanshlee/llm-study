import { CohereClientV2 } from "cohere-ai";
import { applyTemplate, getTemplate } from "./templates";

/**
 * A single message in the chat conversation
 *
 * @example
 * ```typescript
 * const message: ChatMessage = {
 *   role: "user",
 *   content: "Hello, how are you?",
 *   timestamp: new Date()
 * };
 * ```
 */
export interface ChatMessage {
  /** Who sent this message - user, assistant, or system */
  role: "user" | "assistant" | "system";
  /** The actual text content of the message */
  content: string;
  /** Optional timestamp indicating when the message was created */
  timestamp?: Date;
}

/**
 * Configuration options for customizing chatbot behavior
 *
 * @example
 * ```typescript
 * const config: ChatbotConfig = {
 *   model: "command-r-plus",
 *   temperature: 0.7,
 *   maxTokens: 1000,
 *   preamble: "You are a helpful assistant.",
 *   enableStreaming: true
 * };
 * ```
 */
export interface ChatbotConfig {
  /** Which Cohere AI model to use (default: "command-r-plus") */
  model?: string;
  /** Creativity level from 0.0 (deterministic) to 1.0 (very creative) */
  temperature?: number;
  /** Maximum number of tokens in the response (default: 500) */
  maxTokens?: number;
  /** System message that defines the AI's personality and behavior */
  preamble?: string;
  /** Whether to stream the response token by token (default: false) */
  enableStreaming?: boolean;
  /** Name of the currently active prompt template */
  activeTemplate?: string;
}

/**
 * Predefined chatbot personality presets for different use cases
 *
 * - `precise`: Temperature 0.0 - For factual, consistent responses
 * - `balanced`: Temperature 0.3 - For general conversation
 * - `creative`: Temperature 1.0 - For creative and varied responses
 */
export type ChatbotPreset = "precise" | "balanced" | "creative";

/**
 * Pre-configured chatbot settings for common use cases
 *
 * Each preset is optimized for specific scenarios:
 * - Use `precise` for Q&A, fact-checking, technical documentation
 * - Use `balanced` for general conversation and customer support
 * - Use `creative` for brainstorming, storytelling, and creative writing
 *
 * @example
 * ```typescript
 * // Access a specific preset
 * const creativeConfig = CHATBOT_PRESETS.creative;
 * console.log(creativeConfig.temperature); // 1.0
 * ```
 */
export const CHATBOT_PRESETS: Record<ChatbotPreset, ChatbotConfig> = {
  /**
   * Precise preset: Optimized for accuracy and consistency
   *
   * - Temperature: 0.0 (deterministic responses)
   * - Best for: Q&A, summaries, technical documentation, fact-checking
   * - Behavior: Always gives the same answer for the same question
   */
  precise: {
    model: "command-r-plus",
    temperature: 0.0, // No creativity - same answer every time
    maxTokens: 500,
    preamble:
      "You are a helpful and precise assistant. Provide accurate and factual responses.",
    enableStreaming: false,
  },
  /**
   * Balanced preset: Optimal for general conversation
   *
   * - Temperature: 0.3 (some creativity with consistency)
   * - Best for: Customer support, general chat, everyday questions
   * - Behavior: Reliable responses with slight variation
   */
  balanced: {
    model: "command-r-plus",
    temperature: 0.3, // Some creativity - recommended by Cohere docs
    maxTokens: 500,
    preamble: "You are a helpful assistant. Be informative and conversational.",
    enableStreaming: false,
  },
  /**
   * Creative preset: Maximized for imagination and variety
   *
   * - Temperature: 1.0 (maximum creativity)
   * - Best for: Creative writing, brainstorming, storytelling, poetry
   * - Behavior: Highly varied and imaginative responses
   */
  creative: {
    model: "command-r-plus",
    temperature: 1.0, // Maximum creativity - different answers each time
    maxTokens: 500,
    preamble:
      "You are a creative and imaginative assistant. Feel free to be expressive and think outside the box.",
    enableStreaming: false,
  },
};

/**
 * Main chatbot class for handling conversations with the Cohere API
 *
 * This class provides a complete interface for:
 * - Sending messages and receiving responses
 * - Managing conversation history
 * - Using prompt templates for specialized tasks
 * - Configuring AI behavior with presets
 * - Supporting both streaming and regular responses
 *
 * @example Basic usage:
 * ```typescript
 * const bot = new CohereChatbot("your-api-key");
 * const response = await bot.sendMessage("Hello!");
 * console.log(response);
 * ```
 *
 * @example Using presets:
 * ```typescript
 * const creativeBot = CohereChatbot.fromPreset("your-api-key", "creative");
 * const story = await creativeBot.sendMessage("Write a short story about a robot.");
 * ```
 *
 * @example Using templates:
 * ```typescript
 * const bot = CohereChatbot.fromPreset("your-api-key", "balanced");
 * bot.setTemplate("code");
 * const help = await bot.sendTemplatedMessage("How do I sort an array in JavaScript?");
 * ```
 */
export class CohereChatbot {
  /** Cohere API client instance for making requests */
  private client: CohereClientV2;
  /** Current chatbot configuration settings */
  private config: ChatbotConfig;
  /** Array storing all conversation messages in chronological order */
  private conversationHistory: ChatMessage[] = [];

  /**
   * Create a new chatbot instance with custom configuration
   *
   * @param apiKey - Your Cohere API key from https://dashboard.cohere.com/
   * @param config - Optional configuration object to customize behavior
   *
   * @throws {Error} If the API key is invalid or API connection fails
   *
   * @example
   * ```typescript
   * // Basic chatbot with default settings
   * const bot = new CohereChatbot("your-api-key");
   *
   * // Custom configuration
   * const customBot = new CohereChatbot("your-api-key", {
   *   temperature: 0.7,
   *   maxTokens: 1000,
   *   preamble: "You are a helpful coding assistant."
   * });
   * ```
   */
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

  /**
   * Factory method to create a chatbot with a predefined configuration preset
   *
   * This is the recommended way to create a chatbot for most use cases.
   *
   * @param apiKey - Your Cohere API key from https://dashboard.cohere.com/
   * @param preset - The preset configuration to use ("precise", "balanced", or "creative")
   * @returns A new CohereChatbot instance configured with the specified preset
   *
   * @example
   * ```typescript
   * // For factual Q&A
   * const preciseBot = CohereChatbot.fromPreset("your-api-key", "precise");
   *
   * // For general conversation
   * const balancedBot = CohereChatbot.fromPreset("your-api-key", "balanced");
   *
   * // For creative tasks
   * const creativeBot = CohereChatbot.fromPreset("your-api-key", "creative");
   * ```
   */
  public static fromPreset(
    apiKey: string,
    preset: ChatbotPreset,
  ): CohereChatbot {
    const presetConfig = CHATBOT_PRESETS[preset];
    return new CohereChatbot(apiKey, presetConfig);
  }

  /**
   * Get a human-readable description of the current preset configuration
   *
   * @returns A descriptive string indicating the chatbot's current behavior mode
   *
   * @example
   * ```typescript
   * const bot = CohereChatbot.fromPreset("api-key", "creative");
   * console.log(bot.getPresetInfo()); // "creative (imaginative responses)"
   * ```
   */
  public getPresetInfo(): string {
    const temp = this.config.temperature || 0.3;
    if (temp === 0.0) return "precise (focused on accuracy)";
    if (temp <= 0.3) return "balanced (general conversation)";
    if (temp >= 1.0) return "creative (imaginative responses)";
    return `custom (temperature: ${temp})`;
  }

  /**
   * Send a message to the chatbot and receive a response
   *
   * This is the primary method for chatbot interaction. The message is added to
   * the conversation history, sent to the Cohere API, and the response is returned
   * and also added to the history.
   *
   * @param message - The user's message to send to the chatbot
   * @returns Promise that resolves to the chatbot's response text
   *
   * @throws {Error} If the API request fails or returns an invalid response
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   *
   * try {
   *   const response = await bot.sendMessage("What is machine learning?");
   *   console.log("Bot:", response);
   * } catch (error) {
   *   console.error("Failed to get response:", error);
   * }
   * ```
   */
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

  /**
   * Send a regular (non-streaming) message to the Cohere API
   *
   * @returns Promise that resolves to the complete response text from the API
   * @throws {Error} If the API request fails
   * @private
   */
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

  /**
   * Send a streaming message to the Cohere API and display response in real-time
   *
   * The response is displayed to the console character by character as it's generated,
   * providing a typewriter effect for better user experience.
   *
   * @returns Promise that resolves to the complete response text after streaming
   * @throws {Error} If the streaming API request fails
   * @private
   */
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

  /**
   * Format the conversation history for the Cohere API
   *
   * Filters out system messages and converts the internal ChatMessage format
   * to the format expected by the Cohere API.
   *
   * @returns Array of formatted messages suitable for the Cohere API
   * @private
   */
  private formatMessagesForAPI() {
    return this.conversationHistory
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
  }

  /**
   * Get a copy of the complete conversation history
   *
   * Returns a shallow copy to prevent external modification of the internal history.
   * Includes all messages: user messages, assistant responses, and system messages.
   *
   * @returns Array of all ChatMessage objects in chronological order
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * await bot.sendMessage("Hello");
   *
   * const history = bot.getConversationHistory();
   * history.forEach((msg, index) => {
   *   console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
   * });
   * ```
   */
  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear all conversation history and reset to initial state
   *
   * This removes all user messages and assistant responses from memory.
   * If a preamble is configured, it will be re-added as the system message.
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * await bot.sendMessage("Hello");
   * await bot.sendMessage("How are you?");
   *
   * console.log(bot.getConversationHistory().length); // 4 (2 user + 2 assistant)
   * bot.clearHistory();
   * console.log(bot.getConversationHistory().length); // 0 or 1 (only preamble if set)
   * ```
   */
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

  /**
   * Set or update the system preamble message
   *
   * The preamble defines the chatbot's personality, role, and behavior instructions.
   * This method replaces any existing preamble and updates the conversation history.
   *
   * @param preamble - The new system message to set as the chatbot's instructions
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   *
   * // Set the bot to be a coding assistant
   * bot.setPreamble("You are a helpful programming assistant. Always provide code examples and explain your solutions clearly.");
   *
   * // The bot will now behave according to this instruction
   * const response = await bot.sendMessage("How do I reverse a string in Python?");
   * ```
   */
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

  /**
   * Activate a prompt template for specialized conversation modes
   *
   * Templates provide structured prompts for different use cases like coding help,
   * creative writing, or Q&A. Once set, use `sendTemplatedMessage()` to apply the template.
   *
   * @param templateName - Name of the template to activate (e.g., "code", "creative", "qa")
   * @returns True if the template was found and activated, false if template doesn't exist
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   *
   * // Activate coding template
   * const success = bot.setTemplate("code");
   * if (success) {
   *   const response = await bot.sendTemplatedMessage("How do I sort an array?");
   *   // This will be formatted as a coding question with structured response
   * }
   * ```
   *
   * @see {@link sendTemplatedMessage} for using the active template
   * @see {@link clearTemplate} for deactivating templates
   */
  public setTemplate(templateName: string): boolean {
    const template = getTemplate(templateName);
    if (template) {
      this.config.activeTemplate = templateName;
      return true;
    }
    return false;
  }

  /**
   * Get the name of the currently active prompt template
   *
   * @returns The active template name, or undefined if no template is active
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * bot.setTemplate("creative");
   *
   * console.log(bot.getActiveTemplate()); // "creative"
   *
   * bot.clearTemplate();
   * console.log(bot.getActiveTemplate()); // undefined
   * ```
   */
  public getActiveTemplate(): string | undefined {
    return this.config.activeTemplate;
  }

  /**
   * Send a message using the currently active prompt template
   *
   * If a template is active, the user input is inserted into the template's structure
   * before being sent to the API. This provides specialized formatting for different
   * use cases like coding questions, creative requests, or structured Q&A.
   *
   * @param userInput - The user's raw input to be processed through the template
   * @returns Promise that resolves to the chatbot's response
   *
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * bot.setTemplate("code");
   *
   * // This will format the input as a structured coding question
   * const response = await bot.sendTemplatedMessage("reverse a string");
   * // Template adds context like "Programming question: reverse a string"
   * // and requests structured response with code examples
   * ```
   *
   * @see {@link setTemplate} for activating templates
   * @see {@link sendMessage} for direct message sending without templates
   */
  public async sendTemplatedMessage(userInput: string): Promise<string> {
    let finalMessage = userInput;

    // Apply template if one is active
    if (this.config.activeTemplate) {
      const template = getTemplate(this.config.activeTemplate);
      if (template) {
        finalMessage = applyTemplate(template, userInput);
      }
    }

    return await this.sendMessage(finalMessage);
  }

  /**
   * Deactivate the current prompt template and return to direct conversation mode
   *
   * After calling this method, `sendMessage()` will send user input directly
   * without any template formatting.
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * bot.setTemplate("creative");
   *
   * // This uses the creative template
   * await bot.sendTemplatedMessage("Write a story");
   *
   * bot.clearTemplate();
   *
   * // This sends the message directly without template formatting
   * await bot.sendMessage("Hello");
   * ```
   */
  public clearTemplate(): void {
    this.config.activeTemplate = undefined;
  }

  /**
   * Get a copy of the current chatbot configuration
   *
   * Returns a shallow copy to prevent external modification of the internal config.
   *
   * @returns Copy of the current ChatbotConfig object
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   * const config = bot.getConfig();
   *
   * console.log(`Model: ${config.model}`);
   * console.log(`Temperature: ${config.temperature}`);
   * console.log(`Streaming: ${config.enableStreaming}`);
   * ```
   */
  public getConfig(): ChatbotConfig {
    return { ...this.config };
  }

  /**
   * Update the chatbot configuration with new settings
   *
   * Merges the provided partial configuration with the existing configuration.
   * Only the specified properties will be updated.
   *
   * @param newConfig - Partial configuration object with properties to update
   *
   * @example
   * ```typescript
   * const bot = new CohereChatbot("your-api-key");
   *
   * // Update only temperature and streaming
   * bot.updateConfig({
   *   temperature: 0.8,
   *   enableStreaming: true
   * });
   *
   * // Other settings remain unchanged
   * console.log(bot.getConfig().maxTokens); // Still 500 (default)
   * ```
   */
  public updateConfig(newConfig: Partial<ChatbotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
