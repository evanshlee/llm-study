import * as dotenv from "dotenv";
import { demonstrateFeatures } from "./examples";

// Load environment variables
dotenv.config();

async function runDemo(): Promise<void> {
  const apiKey = process.env.COHERE_API_KEY;

  if (!apiKey) {
    console.error("❌ COHERE_API_KEY is not set in your .env file");
    console.log("\n📋 Setup Instructions:");
    console.log("1. Get your API key from: https://dashboard.cohere.com/");
    console.log("2. Copy .env.example to .env: cp .env.example .env");
    console.log(
      "3. Add your API key to .env: COHERE_API_KEY=your_actual_api_key_here",
    );
    console.log("4. Run the demo again: npm run demo\n");
    return;
  }

  console.log("🎯 Running Cohere Chatbot Demo...\n");

  try {
    await demonstrateFeatures(apiKey);
  } catch (error) {
    console.error(
      "❌ Demo failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

runDemo();
