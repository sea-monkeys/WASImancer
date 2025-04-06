# WASImancer Prompt Management API Guide
!!! info "🚧 work in progress"

This guide explains how to use WASImancer's REST API to dynamically add, update, and remove prompts without restarting the server.

## Overview

WASImancer provides a REST API that enables:

- **Publishing new prompts** - Add template-based prompts with variable substitution
- **Updating existing prompts** - Modify a prompt's structure, arguments, and templates
- **Removing prompts** - Delete prompts that are no longer needed

These operations allow you to manage your MCP server's prompts at runtime without service interruption.

## Administration authentication

All Administration API endpoints require authentication using a Bearer token. This token is configured when starting the WASImancer server using the `WASIMANCER_ADMIN_TOKEN` environment variable:

```yaml
environment:
  - WASIMANCER_ADMIN_TOKEN=wasimancer-rocks
```

In all API requests, include this header:

```
Authorization: Bearer wasimancer-rocks
```

## API Endpoints

### 1. Add a New Prompt

Add a new prompt template to the server.

**Endpoint**: `POST /add-prompt`

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: application/json` - Content type for the request body

**Request Body**:
```json
{
  "name": "character-greeting",
  "arguments": [
    {
      "name": "character",
      "type": "string"
    },
    {
      "name": "emotion",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "Greet the user as \${character} feeling \${emotion}",
      "role": "user"
    }
  ]
}
```

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 Prompt character-greeting added successfully",
    "prompt": { ... } // The prompt data you provided
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid prompt data
- Status Code: 403 - Invalid authentication token
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-prompt"

read -r -d '' DATA <<- EOM
{
  "name": "character-greeting",
  "arguments": [
    {
      "name": "character",
      "type": "string"
    },
    {
      "name": "emotion",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "Greet the user as \${character} feeling \${emotion}",
      "role": "user"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

### 2. Update an Existing Prompt

Update an existing prompt's definition, arguments, or messages.

**Endpoint**: `PUT /update-prompt/:name`

**URL Parameters**:
- `:name` - The name of the prompt to update

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: application/json` - Content type

**Request Body**:
Same format as for adding a prompt, but must include the same name as in the URL.

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 Prompt character-greeting updated successfully",
    "prompt": { ... } // The updated prompt data
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid prompt data
- Status Code: 403 - Invalid authentication token
- Status Code: 404 - Prompt not found
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"
PROMPT_NAME="character-greeting"

UPDATE_ENDPOINT="http://localhost:3001/update-prompt/${PROMPT_NAME}"

read -r -d '' DATA <<- EOM
{
  "name": "character-greeting",
  "arguments": [
    {
      "name": "character",
      "type": "string"
    },
    {
      "name": "emotion",
      "type": "string"
    },
    {
      "name": "setting",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "Greet the user as \${character} feeling \${emotion} in a \${setting} setting",
      "role": "user"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

### 3. Remove a Prompt

Remove a prompt from the server.

**Endpoint**: `DELETE /remove-prompt/:name`

**URL Parameters**:
- `:name` - The name of the prompt to remove

**Headers**:
- `Authorization: Bearer <token>` - Authentication token

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🙂 Prompt character-greeting removed successfully"
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing prompt name
- Status Code: 403 - Invalid authentication token
- Status Code: 404 - Prompt not found
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"
PROMPT_NAME="character-greeting"

REMOVE_ENDPOINT="http://localhost:3001/remove-prompt/${PROMPT_NAME}"

curl -X DELETE ${REMOVE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Understanding Prompts in WASImancer

### Prompt Structure

A prompt in WASImancer consists of:

1. **Name**: A unique identifier for the prompt
2. **Arguments**: Variables that can be substituted in the template
   - Each argument has a name and type (string, number, boolean)
3. **Messages**: An array of message templates
   - Each message has text content with variable placeholders
   - Each message has a role (user, assistant, system)

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

## Example Prompt Types

### Conversation Starters

```json
{
  "name": "creative-writing-coach",
  "arguments": [
    {
      "name": "genre",
      "type": "string"
    },
    {
      "name": "topic",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "I am a writing coach specializing in \${genre} fiction. Let's develop a story about \${topic}.",
      "role": "assistant"
    }
  ]
}
```

### Multi-Message Interaction Templates

```json
{
  "name": "interview-simulation",
  "arguments": [
    {
      "name": "position",
      "type": "string"
    },
    {
      "name": "candidateName",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "I am an interviewer for a \${position} position. I'll be conducting your interview today.",
      "role": "assistant"
    },
    {
      "text": "Hello, my name is \${candidateName} and I'm applying for the ${position} role.",
      "role": "user"
    },
    {
      "text": "Great to meet you, \${candidateName}. Can you tell me about your experience with this type of work?",
      "role": "assistant"
    }
  ]
}
```

### Tool Invocation Templates

```json
{
  "name": "search-request",
  "arguments": [
    {
      "name": "query",
      "type": "string"
    },
    {
      "name": "maxResults",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "Please search for information about '\${query}' and return up to \${maxResults} results.",
      "role": "user"
    }
  ]
}
```

## Practical Applications

### 1. Creating an Interactive QA Template

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-prompt"

read -r -d '' DATA <<- EOM
{
  "name": "qa-expert",
  "arguments": [
    {
      "name": "topic",
      "type": "string"
    },
    {
      "name": "expertise_level",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "You are an expert on \${topic}. Provide answers suitable for someone with \${expertise_level} knowledge.",
      "role": "assistant"
    },
    {
      "text": "I'd like to learn more about \${topic}. Can you help me?",
      "role": "user"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

### 2. Creating a Tool-Augmented Prompt

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-prompt"

read -r -d '' DATA <<- EOM
{
  "name": "dice-game-master",
  "arguments": [
    {
      "name": "character_name",
      "type": "string"
    },
    {
      "name": "difficulty",
      "type": "string"
    }
  ],
  "messages": [
    {
      "text": "You are playing as \${character_name} in a tabletop RPG. The game master sets a \${difficulty} challenge. Roll the dice to determine your success.",
      "role": "user"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

## Best Practices

### Designing Effective Prompts

1. **Be Clear and Specific**: Prompts should provide clear instructions
2. **Use Appropriate Context**: Include relevant context in the prompt
3. **Maintain Consistency**: Use consistent language and structure
4. **Consider Roles**: Use "user" and "assistant" roles appropriately

### Organization

1. **Group Related Prompts**: Create prompt families for related use cases
2. **Use Descriptive Names**: Choose names that clearly indicate purpose
3. **Document Arguments**: Provide clear descriptions for each argument

## Conclusion

WASImancer's Prompt Management API provides a powerful way to dynamically extend your MCP server's capabilities without service interruption. By leveraging this API, you can implement dynamic prompt templates that enhance your AI applications with structured, reusable interaction patterns.

The combination of template-based prompts with dynamic management capabilities allows you to create rich, interactive experiences for users while maintaining flexibility and control over your system's behavior.
