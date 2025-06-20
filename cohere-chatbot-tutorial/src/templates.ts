/**
 * @fileoverview Prompt templates for specialized chatbot interactions
 *
 * This module provides predefined prompt templates that format user input
 * for specific use cases, improving the quality and consistency of AI responses.
 * Each template is designed for a particular domain or interaction style.
 */

/**
 * Interface defining the structure of a prompt template
 *
 * @example
 * ```typescript
 * const customTemplate: PromptTemplate = {
 *   name: "summary",
 *   description: "Summarize long texts",
 *   template: "Please summarize the following text: {userInput}"
 * };
 * ```
 */
export interface PromptTemplate {
  /** Unique identifier for the template (used in setTemplate()) */
  name: string;
  /** Human-readable description explaining the template's purpose */
  description: string;
  /** Template string with {userInput} placeholder for user content */
  template: string;
}

/**
 * Collection of predefined prompt templates for different conversation styles
 *
 * Each template is optimized for specific use cases:
 * - **general**: Default conversational assistant
 * - **code**: Programming help with examples and best practices
 * - **creative**: Imaginative tasks like storytelling and brainstorming
 * - **qa**: Structured question-answering with detailed explanations
 *
 * @example Usage with chatbot:
 * ```typescript
 * const bot = new CohereChatbot("api-key");
 * bot.setTemplate("code");
 * const help = await bot.sendTemplatedMessage("sort an array in JavaScript");
 * ```
 */
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

/**
 * Apply user input to a template by replacing the {userInput} placeholder
 *
 * This function takes a template and substitutes the user's input into the
 * template structure, creating a complete prompt ready for the AI.
 *
 * @param template - The template object containing the prompt structure
 * @param userInput - The user's raw input to be inserted into the template
 * @returns The complete prompt with user input substituted
 *
 * @example
 * ```typescript
 * const codeTemplate = getTemplate("code");
 * const prompt = applyTemplate(codeTemplate, "reverse a string");
 * // Returns: "You are an expert programmer... Programming question: reverse a string..."
 * ```
 */
export function applyTemplate(
  template: PromptTemplate,
  userInput: string,
): string {
  return template.template.replace("{userInput}", userInput);
}

/**
 * Retrieve a template by its unique name identifier
 *
 * @param name - The name of the template to find (e.g., "code", "creative", "qa")
 * @returns The matching PromptTemplate object, or undefined if not found
 *
 * @example
 * ```typescript
 * const codeTemplate = getTemplate("code");
 * if (codeTemplate) {
 *   console.log(codeTemplate.description); // "Programming and coding help"
 * }
 *
 * const invalidTemplate = getTemplate("nonexistent");
 * console.log(invalidTemplate); // undefined
 * ```
 */
export function getTemplate(name: string): PromptTemplate | undefined {
  return promptTemplates.find((t) => t.name === name);
}

/**
 * Display all available templates to the console in a formatted list
 *
 * Useful for showing users what templates are available for selection.
 * Each template is displayed with its number, name, and description.
 *
 * @example Output:
 * ```
 * 📝 Available Prompt Templates:
 * 1. general - General conversation and questions
 * 2. code - Programming and coding help
 * 3. creative - Creative writing and storytelling
 * 4. qa - Structured question and answer
 * ```
 */
export function listTemplates(): void {
  console.log("\n📝 Available Prompt Templates:");
  promptTemplates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name} - ${template.description}`);
  });
  console.log();
}
