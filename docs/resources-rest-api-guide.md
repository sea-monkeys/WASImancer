# WASImancer Resource API Guide
!!! info "🚧 work in progress"

This guide explains how to use WASImancer's REST API to dynamically add, update, and remove resources without restarting the server.

## Overview

WASImancer provides REST API endpoints that enable:

- **Adding new resources** - Upload static or dynamic resource definitions 
- **Updating existing resources** - Modify a resource's properties and contents
- **Removing resources** - Delete resources that are no longer needed

These operations allow you to manage your MCP server's resources at runtime without service interruption.

## Authentication

All API endpoints require authentication using a Bearer token. This token is configured when starting the WASImancer server using the `WASIMANCER_AUTH_TOKEN` environment variable:

```yaml
environment:
  - WASIMANCER_AUTH_TOKEN=wasimancer-rocks
```

In all API requests, include this header:

```
Authorization: Bearer wasimancer-rocks
```

## API Endpoints

### 1. Add a New Resource

Add a new static or dynamic resource to the server.

**Endpoint**: `POST /add-resource`

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: application/json` - Content type

**Request Body (Static Resource)**:
```json
{
  "name": "example-info",
  "uri": "info://example",
  "contents": [
    {
      "text": "This is an example static resource"
    },
    {
      "text": "Additional information",
      "customField": "Custom value"
    }
  ]
}
```

**Request Body (Dynamic Resource)**:
```json
{
  "name": "greet-user",
  "uri": "greet-user://{firstName}/{lastName}",
  "arguments": [
    {
      "name": "firstName",
      "type": "string"
    },
    {
      "name": "lastName",
      "type": "string"
    }
  ],
  "contents": [
    {
      "text": "Hello \${firstName} \${lastName}, welcome!"
    }
  ]
}
```

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 Resource example-info added successfully",
    "resource": { ... } // The resource you provided
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid resource data
- Status Code: 403 - Invalid authentication token
- Status Code: 500 - Server error

**cURL Example (Static Resource)**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-resource"

read -r -d '' DATA <<- EOM
{
  "name": "server-info",
  "uri": "config://server-details",
  "contents": [
    {
      "text": "Server configuration details",
      "version": "1.0.0",
      "environment": "production"
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

**cURL Example (Dynamic Resource)**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"

ADD_ENDPOINT="http://localhost:3001/add-resource"

read -r -d '' DATA <<- EOM
{
  "name": "welcome-message",
  "uri": "message://{username}/{language}",
  "arguments": [
    {
      "name": "username",
      "type": "string"
    },
    {
      "name": "language",
      "type": "string"
    }
  ],
  "contents": [
    {
      "text": "Welcome \${username}! You selected \${language} as your preferred language."
    }
  ]
}
EOM

curl -X POST ${ADD_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

### 2. Update an Existing Resource

Update the properties or contents of an existing resource.

**Endpoint**: `PUT /update-resource/:name`

**URL Parameters**:
- `:name` - The name of the resource to update

**Headers**:
- `Authorization: Bearer <token>` - Authentication token
- `Content-Type: application/json` - Content type

**Request Body**:
Same format as for adding a resource, but must include the same name as in the URL

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🎉 Resource server-info updated successfully",
    "oldType": "static",
    "newType": "static",
    "resource": { ... } // The updated resource
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing or invalid resource data
- Status Code: 403 - Invalid authentication token
- Status Code: 404 - Resource not found
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"
RESOURCE_NAME="server-info"

UPDATE_ENDPOINT="http://localhost:3001/update-resource/${RESOURCE_NAME}"

read -r -d '' DATA <<- EOM
{
  "name": "server-info",
  "uri": "config://server-details",
  "contents": [
    {
      "text": "Updated server configuration details",
      "version": "1.1.0",
      "environment": "production",
      "updatedAt": "2025-03-12"
    }
  ]
}
EOM

curl -X PUT ${UPDATE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${DATA}"
```

### 3. Remove a Resource

Remove a resource from the server.

**Endpoint**: `DELETE /remove-resource/:name`

**URL Parameters**:
- `:name` - The name of the resource to remove

**Headers**:
- `Authorization: Bearer <token>` - Authentication token

**Success Response**:
- Status Code: 200
- Body:
  ```json
  {
    "message": "🙂 Resource server-info removed successfully",
    "type": "static"
  }
  ```

**Error Responses**:
- Status Code: 400 - Missing resource name
- Status Code: 403 - Invalid authentication token
- Status Code: 404 - Resource not found
- Status Code: 500 - Server error

**cURL Example**:

```bash
#!/bin/bash
TOKEN="wasimancer-rocks"
RESOURCE_NAME="server-info"

REMOVE_ENDPOINT="http://localhost:3001/remove-resource/${RESOURCE_NAME}"

curl -X DELETE ${REMOVE_ENDPOINT} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Working with Resources

### Static vs. Dynamic Resources

WASImancer automatically determines whether a resource is static or dynamic based on:

1. **Static Resource**: URI with no parameters (doesn't contain curly braces `{}`), or doesn't have an `arguments` field
2. **Dynamic Resource**: URI with parameters (contains one or more `{paramName}` segments) and has an `arguments` field

### Resource Field Descriptions

#### Common Fields

- `name`: A unique identifier for the resource
- `uri`: URI for static resources or URI template for dynamic resources
- `contents`: Array of content objects, each with at least a `text` field

#### Dynamic Resource Fields

- `arguments`: Array of argument definitions for dynamic resources
  - `name`: Argument name (must match parameters in the URI template)
  - `type`: Argument type (for documentation purposes)

## Best Practices

### Naming Conventions

Use consistent, descriptive names for resources:
- Use kebab-case for multi-word resource names (e.g., `server-config`, `user-profile`)
- Use appropriate URI schemes (e.g., `config://`, `info://`, `data://`)

### Resource Organization

Organize resources by purpose and keep them focused:
- Group related information in a single resource
- Prefer multiple content items over deeply nested JSON
- Use clear, consistent structure across resources
