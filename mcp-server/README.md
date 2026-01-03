# @oxog/cli MCP Server

MCP (Model Context Protocol) server for @oxog/cli that enables AI assistants to generate CLI code.

## Tools

### `cli_generate`
Generate CLI code from a description.

**Input:**
- `description` (required): Description of the CLI to generate
- `style` (optional): API style - "fluent", "config", or "decorator" (default: "fluent")

**Output:** Complete CLI code using @oxog/cli

### `cli_explain`
Explain a CLI command structure.

**Input:**
- `code` (required): CLI code to explain

**Output:** Detailed explanation of the code structure

### `cli_migrate`
Migrate Commander.js code to @oxog/cli.

**Input:**
- `code` (required): Commander.js code to migrate

**Output:** Equivalent @oxog/cli code

## Usage

Add to your Claude Desktop or MCP client config:

```json
{
  "mcpServers": {
    "@oxog/cli": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## License

MIT © 2025 Ersin Koç
