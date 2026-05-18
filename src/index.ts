import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { env } from './config/env.js';
import { registerAllTools } from './tools/index.js';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'twoclicksdocs-mcp', status: 'ok' });
});

const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (_req, res) => {
  const server = new McpServer({
    name: 'twoclicksdocs',
    version: '1.0.0',
  });

  registerAllTools(server);

  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);

  res.on('close', () => {
    transports.delete(transport.sessionId);
  });

  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).send('Session not found');
    return;
  }
  await transport.handlePostMessage(req, res, req.body);
});

app.listen(env.port, () => {
  console.log(`✅ MCP Server escutando em http://localhost:${env.port}`);
  console.log(`   SSE endpoint: http://localhost:${env.port}/sse`);
});
