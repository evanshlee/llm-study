import * as dotenv from "dotenv";
import * as readlineSync from "readline-sync";
import { CohereChatbot } from "./chatbot";

// Load environment variables
dotenv.config();

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
  console.log("========================");
  console.log('Type "quit" or "exit" to end the conversation');
  console.log('Type "clear" to clear conversation history');
  console.log('Type "history" to see conversation history');
  console.log('Type "streaming" to toggle streaming mode');
  console.log('Type "preamble" to set a new preamble\n');

  // Initialize chatbot with a default preamble
  const chatbot = new CohereChatbot(apiKey, {
    preamble:
      "You are a helpful AI assistant. Be concise but informative in your responses.",
    enableStreaming: false,
    temperature: 0.7,
  });

  console.log("✅ Chatbot initialized successfully!\n");

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

    if (userInput.toLowerCase() === "preamble") {
      const newPreamble = readlineSync.question("Enter new preamble: ");
      chatbot.setPreamble(newPreamble);
      console.log("✅ Preamble updated!\n");
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
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error("❌ Application error:", error);
  process.exit(1);
});
