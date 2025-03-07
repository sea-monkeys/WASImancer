# Understanding Prompts in WASImancer

## What are Prompts in WASImancer?

Prompts in WASImancer are predefined templates that define how AI models should interact with users or tools. They serve as reusable interaction patterns with customizable variables, allowing for consistent and structured communications between AI applications and the MCP server.

Think of prompts as parameterized scripts where:

- The structure and wording remain consistent
- Variables can be substituted dynamically
- The resulting messages can be used in AI model interactions

## The Value of Prompts

Prompts solve several important challenges in AI application development:

1. **Consistency**: Ensure uniform interaction patterns across sessions
2. **Reusability**: Define templates once and reuse them with different parameters
3. **Maintainability**: Update prompt templates in one place rather than throughout code
4. **Structured Interactions**: Provide clear guidance to AI models
5. **Separation of Concerns**: Keep template definition separate from application logic

## Prompt Configuration

Prompts in WASImancer are defined in the `prompts.yml` file, which organizes them into categories and defines their structure.

### Basic Structure

The basic structure of the `prompts.yml` file is:

```yaml
prompts:
  predefined:
    - name: prompt-name
      arguments:
        - name: arg1
          type: string
        - name: arg2
          type: string
      messages:
        - text: Message with ${arg1} and ${arg2}
          role: user
        - text: Another message in the conversation
          role: assistant
```

### Key Components

1. **Name**: A unique identifier for the prompt
2. **Arguments**: Variable parameters that can be substituted in the template
   - Each argument has a name and type (currently string)
3. **Messages**: An array of message templates
   - Each message has text content with variable placeholders
   - Each message has a role (typically "user" or "assistant")

## Example Prompts

### Simple Greeting

```yaml
prompts:
  predefined:
    - name: greet-user
      arguments:
        - name: nickName
          type: string
      messages:
        - text: Say hello to ${nickName}!
          role: user
```

### Code Analysis

```yaml
prompts:
  predefined:
    - name: code-analyst
      arguments:
        - name: botName
          type: string
        - name: code
          type: string
      messages:
        - text: My name is ${botName}. I am an expert in analyzing code.
          role: assistant
        - text: Analyze my source code: ${code}
          role: user
```

### Tool Interaction

```yaml
prompts:
  predefined:
    - name: roll-dice
      arguments:
        - name: numFaces
          type: string
        - name: numDice
          type: string
      messages:
        - text: 🎲 Rolling ${numDice} dice(s) with ${numFaces} faces...
          role: user
```

## How Prompts Work in WASImancer

When WASImancer starts, it reads the `prompts.yml` file and registers all defined prompts with the MCP server. The server then processes these templates when clients request them with specific argument values.

### Prompt Registration

Inside WASImancer, prompts are registered using code similar to:

```javascript
server.prompt(
  prompt.name,
  schemaObj,  // Zod schema built from argument definitions
  (args) => ({
    messages: prompt.messages.map(message => {
      // Replace template variables in the text
      let text = message.text;
      prompt.arguments.forEach(arg => {
        const regex = new RegExp(`\\$\\{${arg.name}\\}`, 'g');
        text = text.replace(regex, args[arg.name]);
      });
      
      return {
        role: message.role,
        content: {
          type: "text",
          text: text
        }
      };
    })
  })
);
```

This registration process:
1. Registers the prompt name
2. Creates a validation schema for arguments
3. Defines a function that substitutes arguments into the template

### Variable Substitution

The core functionality of prompts is variable substitution, where placeholders in the form `${variableName}` are replaced with actual values provided by the client.

For example, if a prompt template contains:
```
Hello, ${name}! Welcome to ${service}.
```

And a client provides:
```json
{
  "name": "Alice",
  "service": "WASImancer"
}
```

The resulting text would be:
```
Hello, Alice! Welcome to WASImancer.
```

## Using Prompts with MCP Clients

### Listing Available Prompts

In a JavaScript MCP client, you can list available prompts:

```javascript
const prompts = await mcpClient.listPrompts();
console.log("📜 Available Prompts:", prompts);
```

This will return information about all registered prompts, including their names and required arguments.

### Getting a Specific Prompt

To retrieve a specific prompt with arguments:

```javascript
const prompt = await mcpClient.getPrompt({
  name: "roll-dice",
  arguments: { numDice: "3", numFaces: "12" }, // Always use strings for arguments
});

let userInstructions = prompt.messages[0].content.text;
console.log("📝 User Instructions:", userInstructions);
// Output: "🎲 Rolling 3 dice(s) with 12 faces..."
```

### Example: Using a Prompt with an LLM

```javascript
// Fetch a prompt with arguments
const prompt = await mcpClient.getPrompt({
  name: "code-analyst",
  arguments: { 
    botName: "CodeWizard",
    code: "function add(a, b) { return a + b; }"
  },
});

// Extract messages
const messages = prompt.messages.map(msg => [
  msg.role,
  msg.content.text
]);

// Use in LLM conversation
const llmOutput = await llm.invoke(messages);
```

## Best Practices for Prompts

### Designing Effective Prompts

1. **Be Clear and Specific**: Prompts should provide clear instructions
2. **Use Appropriate Context**: Include relevant context in the prompt
3. **Maintain Consistency**: Use consistent language and structure
4. **Consider Roles**: Use "user" and "assistant" roles appropriately

### Technical Implementation

1. **Keep Arguments Simple**: Limit the number and complexity of arguments
2. **Validate Input**: Ensure client-provided values are appropriate
3. **Handle Missing Values**: Provide defaults for optional arguments
4. **Escape Special Characters**: Be careful with characters that might be interpreted specially

### Organization

1. **Group Related Prompts**: Organize prompts by functionality
2. **Use Descriptive Names**: Choose names that clearly indicate purpose
3. **Document Expected Behavior**: Include comments explaining prompt usage

## Use Cases for Prompts

### AI Conversation Starters

```yaml
- name: creative-writing-coach
  arguments:
    - name: genre
      type: string
    - name: topic
      type: string
  messages:
    - text: I am a writing coach specializing in ${genre} fiction. Let's develop a story about ${topic}.
      role: assistant
```

### Tool Invocation Patterns

```yaml
- name: search-request
  arguments:
    - name: query
      type: string
    - name: maxResults
      type: string
  messages:
    - text: Please search for information about "${query}" and return up to ${maxResults} results.
      role: user
```

### Multilingual Support

```yaml
- name: translate-greeting
  arguments:
    - name: language
      type: string
    - name: userName
      type: string
  messages:
    - text: Translate "Hello, ${userName}! How are you today?" into ${language}.
      role: user
```

### Format Standardization

```yaml
- name: product-description
  arguments:
    - name: productName
      type: string
    - name: category
      type: string
    - name: price
      type: string
    - name: features
      type: string
  messages:
    - text: "Create a product description for ${productName} in the ${category} category. It costs ${price} and has these features: ${features}"
      role: user
```

## Advanced Prompt Techniques

### Message Sequences

Prompts can include multiple messages to create a conversation flow:

```yaml
- name: interview-simulation
  arguments:
    - name: position
      type: string
    - name: candidateName
      type: string
  messages:
    - text: I am an interviewer for a ${position} position. I'll be conducting your interview today.
      role: assistant
    - text: Hello, my name is ${candidateName} and I'm applying for the ${position} role.
      role: user
    - text: Great to meet you, ${candidateName}. Can you tell me about your experience with this type of work?
      role: assistant
```

### Combining with Resources

Prompts can be particularly powerful when combined with resources:

```javascript
// Fetch system instructions from resources
const llmInstructions = await mcpClient.readResource({
  uri: "llm://instructions",
});
let systemInstructions = llmInstructions.contents[0].text;

// Fetch a specific prompt with arguments
const prompt = await mcpClient.getPrompt({
  name: "technical-question",
  arguments: { topic: "WebAssembly" },
});

// Combine in a conversation
let messages = [
  ["system", systemInstructions],
  [prompt.messages[0].role, prompt.messages[0].content.text],
];
```

## Future Directions

Future versions of WASImancer may extend prompts with:

1. **More Complex Variables**: Support for structured data in arguments
2. **Conditional Logic**: Include or exclude sections based on conditions
3. **Markup Support**: Allow HTML or Markdown formatting in prompts
4. **Localization**: Built-in support for multiple languages
5. **Prompt Chaining**: Create sequences of prompts that build on each other

## Conclusion

Prompts in WASImancer provide a powerful way to create consistent, reusable templates for AI interactions. By properly configuring and utilizing prompts, you can enhance your AI applications with structured communication patterns that improve consistency and reduce development time.

Whether you're building AI assistants, tool-augmented language models, or complex conversational systems, WASImancer's prompt system provides the flexibility and structure needed to create effective AI interactions.
