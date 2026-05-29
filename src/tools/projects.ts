import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerProjectsTools(server: McpServer) {
  server.tool(
    'list_projects',
    'Lista todos os projetos disponíveis.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
    },
    async ({ token }) => {
      try {
        const client = apiClient(token);
        const res = await client.get('/projects?per_page=100');
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'get_project',
    'Busca um projeto específico por ID.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id: z.number().describe('ID do projeto'),
    },
    async ({ token, id }) => {
      try {
        const client = apiClient(token);
        const res = await client.get(`/projects/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
