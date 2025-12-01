# Mail MCP Server

A Model Context Protocol (MCP) server that provides email sending capabilities using Nodemailer. This server allows AI agents (like Gemini CLI, Claude, etc.) to send emails on your behalf using your own SMTP credentials.

## Features

*   **Send Email**: Send plain text and HTML emails to any recipient.
*   **Secure**: Uses your own SMTP server credentials (Gmail, Outlook, AWS SES, etc.).
*   **Logging**: Automatically logs email activities to daily files in the `log/` directory for audit and debugging.

## Prerequisites

*   **Node.js**: v14 or higher.
*   **SMTP Credentials**: Host, port, user, and password for your email provider.

## MCP Client Configuration

To use this server with your MCP client, you need to configure it to run the `index.js` script. You have two main ways to integrate and provide your SMTP credentials:

### Option 1: Local Installation (Recommended for Development)

This method is ideal when you're developing locally or want to run the server directly from its cloned repository. You will provide the **absolute path** to the `index.js` file.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/u1pns/sendmail-mcp.git
    cd sendmail-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    You can pass the environment variables directly in your MCP client's configuration file (preferred for portability) or use a `.env` file in the project's root directory.

    *   **Using `env` block in client config (Recommended):**

        #### Gemini CLI (`settings.json`)
        Add this to your `mcpServers` object in the `.gemini/settings.json` file:

        ```json
        {
          "mcpServers": {
            "sendmail-mcp": {
              "command": "node",
              "args": ["/absolute/path/to/sendmail-mcp/index.js"],
              "env": {
                "SMTP_HOST": "smtp.example.com",
                "SMTP_PORT": "465",
                "SMTP_SECURE": "true",
                "SMTP_USER": "your_email@example.com",
                "SMTP_PASS": "your_password",
                "MAIL_FROM": "sender@example.com"
              }
            }
          }
        }
        ```

        *   **Important:** Replace `/absolute/path/to/sendmail-mcp/index.js` with the full path to your cloned `index.js` file on your computer (e.g., `/Users/jpons/mcp/sendmail-mcp/index.js`).

        #### Claude Desktop (`claude_desktop_config.json`)
        Add this to your `mcpServers` object:

        ```json
        {
          "mcpServers": {
            "sendmail-mcp": {
              "command": "node",
              "args": ["/absolute/path/to/sendmail-mcp/index.js"],
              "env": {
                "SMTP_HOST": "smtp.example.com",
                "SMTP_PORT": "465",
                "SMTP_SECURE": "true",
                "SMTP_USER": "your_email@example.com",
                "SMTP_PASS": "your_password",
                "MAIL_FROM": "sender@example.com"
              }
            }
          }
        }
        ```

    *   **Using a `.env` file (Alternative for local setup):**
        1.  Create a `.env` file in the root of the `sendmail-mcp` directory (use `.env.example` as a template).
        2.  Fill in your SMTP credentials in the `.env` file.
        3.  Configure your MCP client to just run the script **without** the `env` block.

        #### Generic Configuration (Gemini/Claude)
        ```json
        {
          "mcpServers": {
            "sendmail-mcp": {
              "command": "node",
              "args": ["/absolute/path/to/sendmail-mcp/index.js"]
            }
          }
        }
        ```
        *The server will automatically load the credentials from the `.env` file located in the same directory as `index.js`.*

### Option 2: Using `npx`

This method is similar to how `chrome-devtools-mcp` is used, where you can reference the package directly via `npx` after it has been published to the npm registry. This provides a more convenient and globally accessible way to use the server.

*   **Prerequisite**: This `sendmail-mcp` package must be published to npm (e.g., `npm publish`).

#### Gemini CLI (`settings.json`)
Add this to your `mcpServers` object in the `.gemini/settings.json` file:

```json
{
  "mcpServers": {
    "sendmail-mcp": {
      "command": "npx",
      "args": ["sendmail-mcp@latest"],
      "env": {
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "465",
        "SMTP_SECURE": "true",
        "SMTP_USER": "your_email@example.com",
        "SMTP_PASS": "your_password",
        "MAIL_FROM": "sender@example.com"
      }
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`)
Add this to your `mcpServers` object:

```json
{
  "mcpServers": {
    "sendmail-mcp": {
      "command": "npx",
      "args": ["sendmail-mcp@latest"],
      "env": {
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "465",
        "SMTP_SECURE": "true",
        "SMTP_USER": "your_email@example.com",
        "SMTP_PASS": "your_password",
        "MAIL_FROM": "sender@example.com"
      }
    }
  }
}
```

### Environment Variables Reference

Regardless of the method you use, these are the variables you need to set:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SMTP_HOST` | Hostname of your SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | Port number (usually 465 for SSL or 587 for TLS) | `465` |
| `SMTP_SECURE` | Set to `true` for port 465, `false` for others | `true` |
| `SMTP_USER` | Your email username | `user@gmail.com` |
| `SMTP_PASS` | Your email password (or App Password) | `secret` |
| `MAIL_FROM` | The email address to send from | `user@gmail.com` |

## Tools

This server exposes a single tool to the MCP client:

### `send_email`

Sends an email using the configured SMTP server.

**Inputs:**
*   `to` (string, required): The recipient's email address.
*   `subject` (string, required): The subject line of the email.
*   `text` (string, required): The plain text content of the email.
*   `html` (string, optional): The HTML content of the email (for rich text).

## Usage

Once configured, you can use natural language to interact with the server through your AI agent.

**Example Prompts:**

> "Send an email to `boss@company.com` saying I'll be late to the meeting."

> "Email the weekly report to the team with the subject 'Weekly Status' and the body 'All systems go'."

> "Send a test email to myself to verify the SMTP connection."

## Development

If you want to modify or contribute to this project:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd mail-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Local Testing:**
    You can create a `.env` file for local testing during development (though the MCP client configuration handles env vars in production usage).
    ```bash
    cp .env.example .env
    ```

## Server Lifecycle

It's important to understand that this MCP server operates as a child process of your MCP client (e.g., Gemini CLI). This means:

*   **Starts with Client**: The server process is automatically launched by the MCP client when the client starts or when it first needs to interact with the server's tools.
*   **Stops with Client**: When you close your MCP client (e.g., exit Gemini CLI), the client will automatically terminate the server process. It does not run indefinitely in the background.

## Troubleshooting

*   **Authentication Failed**: If using Gmail, ensure you have 2-Factor Authentication enabled and are using an **App Password**, not your main password.
*   **Connection Refused**: Check your firewall settings and ensure `SMTP_PORT` is correct.
*   **Logs**: Check the `log/` directory in the project folder. Logs are rotated daily (e.g., `2025-12-01.log`).

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.