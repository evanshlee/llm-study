import * as dotenv from "dotenv";
import * as readlineSync from "readline-sync";
import { ChatbotPreset, CohereChatbot } from "./chatbot";

// Load environment variables
dotenv.config();

function selectPreset(): ChatbotPreset {
  console.log("🎯 Choose your chatbot style:");
  console.log("1. Precise - Focused on accuracy (temperature: 0.0)");
  console.log("2. Balanced - General conversation (temperature: 0.3)");
  console.log("3. Creative - Imaginative responses (temperature: 1.0)");

  const choice = readlineSync.question("\nSelect (1-3) [default: 2]: ") || "2";

  switch (choice) {
    case "1":
      return "precise";
    case "3":
      return "creative";
    default:
      return "balanced";
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.COHERE_API_KEY;

  if (!apiKey) {
    console.error("❌ COHERE_API_KEY is not set in your .env file");
    console.log("Please add your Cohere API key to the .env file:");
    console.log("COHERE_API_KEY=your_actual_api_key_here");
    console.log("\nGet your API key from: https://dashboard.cohere.com/");
    process.exit(1);
  }

  console.log("🤖 Cohere Chatbot Tutorial");
  console.log("========================\n");

  // Let user select preset
  const selectedPreset = selectPreset();
  const chatbot = CohereChatbot.fromPreset(apiKey, selectedPreset);

  console.log(`\n✅ Chatbot initialized with ${selectedPreset} preset`);
  console.log(`📊 Mode: ${chatbot.getPresetInfo()}\n`);

  console.log("💬 Available commands:");
  console.log('- "quit" or "exit" to end the conversation');
  console.log('- "clear" to clear conversation history');
  console.log('- "history" to see conversation history');
  console.log('- "streaming" to toggle streaming mode');
  console.log('- "info" to see current configuration\n');

  while (true) {
    const userInput = readlineSync.question("You: ");

    if (
      userInput.toLowerCase() === "quit" ||
      userInput.toLowerCase() === "exit"
    ) {
      console.log("👋 Goodbye!");
      break;
    }

    if (userInput.toLowerCase() === "clear") {
      chatbot.clearHistory();
      console.log("🧹 Conversation history cleared!\n");
      continue;
    }

    if (userInput.toLowerCase() === "history") {
      const history = chatbot.getConversationHistory();
      console.log("\n📜 Conversation History:");
      console.log("========================");
      history.forEach((msg, index) => {
        const timestamp = msg.timestamp?.toLocaleTimeString() || "";
        console.log(
          `${index + 1}. [${timestamp}] ${msg.role.toUpperCase()}: ${
            msg.content
          }`,
        );
      });
      console.log("========================\n");
      continue;
    }

    if (userInput.toLowerCase() === "streaming") {
      const config = chatbot.getConfig();
      const newStreamingState = !config.enableStreaming;
      chatbot.updateConfig({ enableStreaming: newStreamingState });
      console.log(
        `🔄 Streaming mode ${newStreamingState ? "enabled" : "disabled"}\n`,
      );
      continue;
    }

    if (userInput.toLowerCase() === "info") {
      const config = chatbot.getConfig();
      console.log("\n📊 Current Configuration:");
      console.log("========================");
      console.log(`Model: ${config.model}`);
      console.log(`Temperature: ${config.temperature}`);
      console.log(`Max Tokens: ${config.maxTokens}`);
      console.log(
        `Streaming: ${config.enableStreaming ? "enabled" : "disabled"}`,
      );
      console.log(`Mode: ${chatbot.getPresetInfo()}`);
      console.log("========================\n");
      continue;
    }

    if (userInput.trim() === "") {
      continue;
    }

    try {
      console.log("🤖 Assistant: ", { end: "" });
      const response = await chatbot.sendMessage(userInput);

      // If not streaming, print the response
      if (!chatbot.getConfig().enableStreaming) {
        console.log(response);
      }

      console.log(); // Empty line for better readability
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error",
      );
      console.log(); // Empty line for better readability
    }
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  },
);

// Run the main function
main().catch((error) => {
  console.error("❌ Application error:", error);
  process.exit(1);
});
