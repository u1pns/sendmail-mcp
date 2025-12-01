#!/usr/bin/env node
require('dotenv').config();
const nodemailer = require('nodemailer');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Function to log messages to a daily file
function logMessage(message, type = 'info') {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const logFileName = `${date}.log`;
  const logFilePath = path.join(LOG_DIR, logFileName);
  const timestamp = now.toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    // Fail silently or use a backup logging method to avoid infinite loops if stderr is captured
  });
  // Do NOT console.log here as it interferes with Stdio transport
  // console.error(message); // Only write to stderr if necessary
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logMessage(`Email sent to ${to}: ${info.messageId}`, 'info');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logMessage(`Error sending email to ${to}: ${error.message}`, 'error');
    throw error;
  }
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'mail-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    return {
      tools: [
        {
          name: 'send_email',
          description: 'Send an email using configured SMTP settings',
          inputSchema: {
            type: 'object',
            properties: {
              to: {
                type: 'string',
                description: 'Recipient email address',
              },
              subject: {
                type: 'string',
                description: 'Email subject',
              },
              text: {
                type: 'string',
                description: 'Plain text body of the email',
              },
              html: {
                type: 'string',
                description: 'HTML body of the email (optional)',
              },
            },
            required: ['to', 'subject', 'text'],
          },
        },
      ],
    };
  } catch (error) {
    logMessage(`Error listing tools: ${error.message}`, 'error');
    throw error; // Re-throw so MCP knows something went wrong
  }
});

// Call Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === 'send_email') {
      const { to, subject, text, html } = request.params.arguments;
      
      logMessage(`Received send_email request for: ${to}`, 'info');
      
      try {
        const result = await sendEmail(to, subject, text, html);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logMessage(`Error executing send_email: ${error.message}`, 'error');
        // Return a clean error response to the client
        return {
          content: [
            {
              type: 'text',
              text: `Error sending email: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
    throw new Error(`Tool not found: ${request.params.name}`);
  } catch (error) {
    logMessage(`Unexpected error in CallToolRequest: ${error.message}`, 'error');
    return {
      content: [
        {
          type: 'text',
          text: `Internal server error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Connect transport
async function run() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logMessage('Mail MCP Server running on stdio', 'info');
  } catch (error) {
    logMessage(`Failed to start MCP server: ${error.message}`, 'error');
    console.error(`Fatal error starting server: ${error.message}`);
    process.exit(1);
  }
}

run().catch((error) => {
  logMessage(`Fatal error: ${error}`, 'error');
  process.exit(1);
});