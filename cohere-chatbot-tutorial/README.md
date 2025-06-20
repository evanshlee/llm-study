# Cohere Chatbot Tutorial

**This** project teaches you how to build a chatbot using the Cohere API.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Your API Key

1. Copy the example file to create your config:

```bash
cp .env.example .env
```

2. Get your API key from [Cohere Dashboard](https://dashboard.cohere.com/).

3. Add your API key to the `.env` file:

```
COHERE_API_KEY=your_actual_api_key_here
```

### 3. Project build

```bash
npm run build
```

### 3. Run the Chatbot and Choose Your Style

**For development (recommended):**

```bash
npm run dev
```

**For production (build first):**

```bash
npm run build
npm start
```

When you start the program, you can choose from 3 chatbot styles:

```
🎯 Choose your chatbot style:
1. Precise - Best for questions, summaries (temperature: 0.0)
2. Balanced - Good for normal chat (temperature: 0.3)
3. Creative - Best for poems, ideas (temperature: 1.0)

Select (1-3) [default: 2]:
```

#### What Each Style Does

1. **Precise** - Temperature: 0.0

   - Best for: Q&A, summaries, technical docs
   - Always gives the same answer
   - Very accurate and factual

2. **Balanced** - Temperature: 0.3

   - Best for: Normal conversations
   - Cohere's recommended default setting
   - Mix of accuracy and creativity

3. **Creative** - Temperature: 1.0
   - Best for: Poetry, brainstorming, storytelling
   - Different answers each time
   - Very imaginative responses

## 📚 What You Will Learn

### 1. Basic Chatbot Setup

- How to connect to Cohere API
- Send messages and get responses
- Handle errors properly

### 2. Preset System (Based on Cohere Docs)

- **Precise**: For accuracy (temperature: 0.0) - Q&A, summaries
- **Balanced**: For normal chat (temperature: 0.3) - everyday conversations
- **Creative**: For imagination (temperature: 1.0) - poetry, brainstorming
- **Dynamic Settings**: Change configuration while running

### 3. Advanced Features

- **Streaming**: See responses word-by-word as AI writes
- **Memory**: Keep track of conversation history
- **Easy Setup**: Choose the right style when you start

### 4. Chat Commands

- `quit` or `exit` = stop the program
- `clear` = delete chat history
- `history` = show all messages
- `streaming` = turn word-by-word mode on/off
- `info` = show current settings

## 🏗️ Project Structure

```
src/
├── chatbot.ts      # Main chatbot class
└── index.ts        # Command line interface
```

## 🔧 Main Class: `CohereChatbot`

### Configuration Options (`ChatbotConfig`)

- `model`: Which AI model to use (default: 'command-r-plus')
- `temperature`: How creative responses are (0.0-1.0, default: 0.3)
- `maxTokens`: Maximum response length (default: 500)
- `preamble`: Instructions for AI personality
- `enableStreaming`: Show response word-by-word

### Easy Preset Methods

- `CohereChatbot.fromPreset(apiKey, 'precise')`: For accurate answers
- `CohereChatbot.fromPreset(apiKey, 'balanced')`: For normal chat
- `CohereChatbot.fromPreset(apiKey, 'creative')`: For creative writing

### Main Methods

- `sendMessage(message: string)`: Send message and get response
- `getConversationHistory()`: See all chat messages
- `clearHistory()`: Delete chat history
- `getPresetInfo()`: Check current preset info
- `updateConfig(config: Partial<ChatbotConfig>)`: Change settings

## 📝 Code Examples

### Using Presets

```typescript
import { CohereChatbot } from "./src/chatbot";

// For accurate answers (Q&A, summaries)
const preciseBot = CohereChatbot.fromPreset("your-api-key", "precise");

// For normal conversations
const balancedBot = CohereChatbot.fromPreset("your-api-key", "balanced");

// For creative tasks (poetry, brainstorming)
const creativeBot = CohereChatbot.fromPreset("your-api-key", "creative");

const response = await preciseBot.sendMessage("What is machine learning?");
console.log(response);
```

### Custom Settings

```typescript
const customBot = new CohereChatbot("your-api-key", {
  temperature: 0.5,
  preamble: "You are a helpful coding assistant.",
  enableStreaming: false,
});
```

### Streaming Mode

```typescript
const streamingBot = CohereChatbot.fromPreset("your-api-key", "creative");
streamingBot.updateConfig({ enableStreaming: true });

// Response appears word by word as AI writes
await streamingBot.sendMessage("Write a poem about programming");
```

## 🔑 Getting Your API Key

1. Go to [Cohere Dashboard](https://dashboard.cohere.com/)
2. Create account or sign in
3. Go to API Keys section and create new key
4. Add your key to the `.env` file

## 🛠️ Development Commands

- `npm run dev`: Run in development mode (uses ts-node)
- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Auto-compile when files change
- `npm start`: Run the compiled JavaScript
- `npm run clean`: Delete build folder

## 🎯 Learning Goals

This tutorial teaches you:

1. **Cohere API Basics**

   - How to set up API client
   - How to use chat endpoint
   - How to control output with temperature

2. **Chatbot Architecture**

   - How to manage message history
   - How to handle state
   - How to implement preset system

3. **Advanced Features**

   - Real-time streaming responses
   - Dynamic configuration changes
   - Optimization for different use cases

4. **TypeScript Best Practices**
   - Type safety (no `any` types)
   - Interface design
   - Factory pattern implementation
   - Error handling

## 🤝 Contributing

If you want to help improve this project:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 🆘 Troubleshooting

If you have problems:

1. Check if your API key is correct in `.env` file
2. Check your internet connection
3. Make sure your API key is valid and has permissions
4. Check if you've reached Cohere API usage limits
