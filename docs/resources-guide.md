# Understanding Resources in WASImancer

## What are Resources in WASImancer?

Resources in WASImancer are predefined information elements that can be accessed by MCP clients. They provide a way to store and deliver static data, contextual information, or configuration details that AI models or applications can query and utilize.

Resources serve as a central repository of information that can be referenced consistently across different interactions, making them ideal for:

- System instructions for large language models
- Reference information for tools
- Context data for AI applications
- Configuration settings for clients

## Resource Configuration

Resources in WASImancer are defined in the `resources.yml` file, which follows a specific structure to organize both static and (in future versions) dynamic resources.

### Basic Structure

The basic structure of the `resources.yml` file is:

```yaml
resources:
  static:
    - name: resource-name
      uri: scheme://identifier
      contents:
        - text: Resource content goes here
          # Additional key-value pairs can be included
          key1: value1
          key2: value2
        - text: Another content item
          # Multiple content items can be defined
  
  dynamic: # Reserved for future use
    # Dynamic resources will be added in future versions
```

### Key Components

1. **Name**: A unique identifier for the resource within WASImancer
2. **URI**: A URI-style identifier that follows the format `scheme://identifier` 
3. **Contents**: An array of content items, each with at least a `text` field and optionally additional key-value pairs

### URI Schemes

WASImancer supports various URI schemes to identify different types of resources:

- `config://`: Configuration settings
- `info://`: Informational content
- `llm://`: Large Language Model specific content (like system instructions)
- `data://`: Data references
- `doc://`: Documentation

These schemes help organize resources and make their purpose clear to both developers and clients.

## Example Resources

### System Instructions for LLMs

```yaml
resources:
  static:
    - name: llm-instructions
      uri: llm://instructions
      contents:
        - text: You are a helpful AI assistant. You can help users by providing information and assistance with various tasks.
```

### Server Information

```yaml
resources:
  static:
    - name: server-info
      uri: config://server
      contents:
        - text: This is WASImancer [0.0.1], running on MCP!
```

### User Profile Information

```yaml
resources:
  static:
    - name: user-profile
      uri: info://user
      contents:
        - text: User information
          firstName: John
          lastName: Doe
          role: Administrator
          preferences:
            theme: dark
            language: en-US
```

### Multiple Content Items

Resources can have multiple content items, each potentially with different attributes:

```yaml
resources:
  static:
    - name: documentation
      uri: doc://api-reference
      contents:
        - text: API Overview
          section: introduction
          format: markdown
        - text: Getting Started with the API
          section: quickstart
          format: markdown
        - text: API Endpoints
          section: reference
          format: json
          schema: "https://example.com/schemas/api.json"
```

## How Resources Work in WASImancer

When WASImancer starts, it reads the `resources.yml` file and registers all defined resources with the MCP server. The server then makes these resources available to clients through the MCP protocol.

### Resource Registration

Inside WASImancer, resources are registered using code similar to:

```javascript
server.resource(
  resource.name,
  resource.uri,
  async (uri) => ({
    contents: resource.contents.map(content => ({
      uri: uri.href,  // Required field
      ...content      // Spread all other properties from YAML
    }))
  })
);
```

This makes each resource accessible via its URI.

### Client Access

MCP clients can access resources in two steps:

1. **List Resources**: Clients can request a list of all available resources
2. **Read Resource**: Clients can request the contents of a specific resource by URI

This two-step process allows clients to discover available resources and then access those they need.

## Using Resources with MCP Clients

### Listing Available Resources

In a JavaScript MCP client, you can list available resources:

```javascript
const resources = await mcpClient.listResources();
console.log("📜 Available Resources:", resources);
```

The response will include all resource names and URIs.

### Reading a Specific Resource

To read the contents of a specific resource:

```javascript
const llmInstruction = await mcpClient.readResource({
  uri: "llm://instructions",
});

// Resource Content:
let systemInstructions = llmInstruction.contents[0].text;
console.log("📝 System Instructions:", systemInstructions);
```

### Example: Using a Resource with an LLM

```javascript
// Fetch system instructions from resources
const llmInstruction = await mcpClient.readResource({
  uri: "llm://instructions",
});
let systemInstructions = llmInstruction.contents[0].text;

// Use in LLM conversation
const llmWithTools = llm.bindTools(langchainTools);
let messages = [
  ["system", systemInstructions],
  ["user", userQuery],
];
var llmOutput = await llmWithTools.invoke(messages);
```

## Best Practices for Resources

### Organizing Resources

1. **Use Consistent Naming**: Follow a clear naming convention for resources
2. **Group Related Resources**: Use URI schemes to group related resources
3. **Keep Content Focused**: Each resource should have a specific purpose
4. **Use Multiple Content Items**: When appropriate, break complex information into multiple content items

### Structure and Format

1. **Include Descriptive Text**: Always provide a clear `text` field for each content item
2. **Use Appropriate Metadata**: Add relevant key-value pairs to provide context and structure
3. **Consider Format Needs**: Structure content based on how it will be used by clients

### Security and Privacy

1. **Avoid Sensitive Data**: Do not store sensitive data in resources unless necessary
2. **Use Vague References**: When referring to internal details, be general rather than specific
3. **Consider Validation**: Implement validation for resource contents in critical applications

## Use Cases for Resources

### AI System Instructions

Resources are ideal for storing system instructions for language models:

```yaml
- name: coding-assistant
  uri: llm://coding-instructions
  contents:
    - text: You are an expert coding assistant. You help users write, understand, and debug code. Focus on providing clear explanations and practical solutions.
```

### Configuration Settings

Store configuration information that clients may need:

```yaml
- name: api-config
  uri: config://api
  contents:
    - text: API Configuration
      rateLimit: 100
      timeoutSeconds: 30
      version: "2.0"
```

### Context Data

Provide contextual information for specialized tools:

```yaml
- name: weather-context
  uri: data://weather-service
  contents:
    - text: Weather Service Information
      provider: "WeatherAPI"
      units: "metric"
      defaultLocation: "San Francisco"
```

### Client Documentation

Offer reference documentation for client applications:

```yaml
- name: client-docs
  uri: doc://client
  contents:
    - text: The client should first list available tools using the listTools() method, then choose appropriate tools based on user needs.
```

## Future Directions: Dynamic Resources

While currently WASImancer focuses on static resources, future versions will introduce dynamic resources that can:

1. **Generate Content**: Create content on-demand based on parameters
2. **Access External Data**: Fetch information from databases or APIs
3. **Personalize Content**: Adapt resource content based on client or user information

This will make resources even more powerful for delivering contextual information to AI applications.

## Conclusion

Resources in WASImancer provide a flexible and standardized way to deliver contextual information to MCP clients. By properly configuring and utilizing resources, you can enhance your AI applications with consistent reference information, configuration settings, and contextual data.

The structured nature of resources makes them ideal for storing system instructions for large language models, providing reference information for tools, and configuring client applications in a centralized and consistent manner.
