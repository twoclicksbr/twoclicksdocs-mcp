import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerProjectsTools } from './projects.js';
import { registerDocumentsTools } from './documents.js';
import { registerBlocksTools } from './blocks.js';
import { registerTasksTools } from './tasks.js';
import { registerDetailsTools } from './details.js';
import { registerSupportTools } from './support.js';
import { registerSharesTools } from './shares.js';
import { registerAuxWriteTools } from './aux-write.js';
import { registerUsersTools } from './users.js';

export function registerAllTools(server: McpServer) {
  registerProjectsTools(server);
  registerDocumentsTools(server);
  registerBlocksTools(server);
  registerTasksTools(server);
  registerDetailsTools(server);
  registerSupportTools(server);
  registerSharesTools(server);
  registerAuxWriteTools(server);
  registerUsersTools(server);
}
