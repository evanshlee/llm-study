// Simple prompt templates for the chatbot
// Each template has a clear purpose and includes user input

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    name: "general",
    description: "General conversation and questions",
    template: `You are a helpful and friendly AI assistant. Please answer the user's question clearly and helpfully.

User question: {userInput}

Please provide a clear and helpful response:`,
  },
  {
    name: "code",
    description: "Programming and coding help",
    template: `You are an expert programmer and coding mentor. Help the user with their programming question or problem.

Programming question: {userInput}

Please provide:
1. A clear explanation
2. Code examples if needed
3. Best practices or tips

Response:`,
  },
  {
    name: "creative",
    description: "Creative writing and storytelling",
    template: `You are a creative writing assistant. Help the user with creative tasks like stories, poems, or creative ideas.

Creative request: {userInput}

Please be imaginative, engaging, and help bring their creative vision to life:`,
  },
  {
    name: "qa",
    description: "Structured question and answer",
    template: `You are a knowledgeable expert. Answer the user's question with accurate, well-structured information.

Question: {userInput}

Please provide:
- A direct answer
- Supporting details
- Relevant context if helpful

Answer:`,
  },
];

// Function to apply user input to a template
export function applyTemplate(
  template: PromptTemplate,
  userInput: string,
): string {
  return template.template.replace("{userInput}", userInput);
}

// Function to get template by name
export function getTemplate(name: string): PromptTemplate | undefined {
  return promptTemplates.find((t) => t.name === name);
}

// Function to list all available templates
export function listTemplates(): void {
  console.log("\n📝 Available Prompt Templates:");
  promptTemplates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name} - ${template.description}`);
  });
  console.log();
}
