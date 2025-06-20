import { CohereChatbot } from "./chatbot";

// Example demonstrating different chatbot features
async function demonstrateFeatures(apiKey: string): Promise<void> {
  console.log("🚀 Cohere Chatbot Features Demo");
  console.log("================================\n");

  // 1. Basic chatbot without streaming
  console.log("1️⃣ Basic Chatbot (No Streaming)");
  console.log("--------------------------------");
  const basicBot = new CohereChatbot(apiKey, {
    preamble: "You are a helpful assistant that provides concise answers.",
    enableStreaming: false,
  });

  try {
    const response1 = await basicBot.sendMessage(
      "What is artificial intelligence?",
    );
    console.log("🤖 Response:", response1);
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // 2. Streaming chatbot
  console.log("2️⃣ Streaming Chatbot");
  console.log("---------------------");
  const streamingBot = new CohereChatbot(apiKey, {
    preamble:
      "You are an AI assistant that explains complex topics in simple terms.",
    enableStreaming: true,
    temperature: 0.8,
  });

  try {
    console.log("🤖 Streaming Response: ");
    await streamingBot.sendMessage("Explain machine learning in simple terms.");
    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // 3. Conversation with history
  console.log("3️⃣ Conversation with History");
  console.log("-----------------------------");
  const conversationBot = new CohereChatbot(apiKey, {
    preamble: "You are a helpful coding assistant.",
    enableStreaming: false,
  });

  try {
    await conversationBot.sendMessage("What is TypeScript?");
    const response2 = await conversationBot.sendMessage(
      "How is it different from JavaScript?",
    );
    console.log("🤖 Response:", response2);

    console.log("\n📜 Conversation History:");
    const history = conversationBot.getConversationHistory();
    history.forEach((msg, index) => {
      if (msg.role !== "system") {
        console.log(
          `${index}. ${msg.role.toUpperCase()}: ${msg.content.substring(
            0,
            50,
          )}...`,
        );
      }
    });
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // 4. Dynamic preamble changes
  console.log("4️⃣ Dynamic Preamble Changes");
  console.log("----------------------------");
  const dynamicBot = new CohereChatbot(apiKey);

  try {
    dynamicBot.setPreamble("You are a creative writing assistant.");
    const creativeResponse = await dynamicBot.sendMessage(
      "Write a short poem about coding.",
    );
    console.log("🎨 Creative Response:", creativeResponse);

    dynamicBot.setPreamble("You are a technical documentation writer.");
    const technicalResponse = await dynamicBot.sendMessage(
      "Write a short poem about coding.",
    );
    console.log("📖 Technical Response:", technicalResponse);
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("✅ Demo completed!");
}

// Export for use in other files
export { demonstrateFeatures };
