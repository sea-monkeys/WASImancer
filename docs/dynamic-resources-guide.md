# WASImancer Dynamic Resources
!!! info "🚧 work in progress"

## Introduction to Dynamic Resources

Dynamic resources in WASImancer are template-based resources that can accept arguments through URI templates. Unlike static resources which have fixed content, dynamic resources can generate different content based on the parameters provided in the request URI.

## Defining Dynamic Resources

Dynamic resources are defined in your `resources.yml` file under the `dynamic` section:

```yaml
resources:
  dynamic:
    - name: echo
      uri: echo://{message}
      arguments:
        - name: 'message'
          type: 'string' # for informational purposes only
      contents:
        - text: 'Resource echo: ${message}'
```

### Configuration Properties:

- `name`: A unique identifier for the resource
- `uri`: A URI template with variables in curly braces (e.g., `echo://{message}`)
- `arguments`: An array defining each argument the resource accepts:
  - `name`: The argument name (must match the variable in the URI template)
  - `type`: The argument type (string, number, boolean, etc.) ✋ *for informational purposes only*
- `contents`: An array of content templates where the actual values can be referenced using `${variableName}` syntax

## How URI Templates Work

URI templates allow you to define a pattern for your resource URIs with placeholder variables:

1. Variables are defined using curly braces: `{variableName}`
2. When a client requests the resource, the actual values are extracted from the URI
3. These values are then available to use in your content using the `${variableName}` syntax

## Examples

### Basic Example: Echo Resource

```yaml
dynamic:
  - name: echo
    uri: echo://{message}
    arguments:
      - name: 'message'
        type: 'string'
    contents:
      - text: 'Resource echo: ${message}'
```

When a client requests `echo://hello_world`, the server responds with:
```
Resource echo: hello_world
```

### Multiple Parameters: Greeting Resource

```yaml
dynamic:
  - name: greeting
    uri: greeting://{name}/{language}
    arguments:
      - name: 'name'
        type: 'string'
      - name: 'language'
        type: 'string'
    contents:
      - text: 'Hello ${name} in ${language}!'
```

When a client requests `greeting://John/Spanish`, the server responds with:
```
Hello John in Spanish!
```

## Summary

Dynamic resources in WASImancer provide a powerful way to create flexible, parameterized resources that can generate different content based on user input. By using URI templates and argument definitions, you can create resources that respond dynamically to different requests.