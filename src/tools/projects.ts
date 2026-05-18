import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerProjectsTools(server: McpServer) {
  server.tool(
    'list_projects',
    'Lista todos os projetos disponíveis. Use isso para descobrir quais slugs existem (ex: smartclick360, bethel360).',
    {
      project: z.string().describe('Slug de QUALQUER projeto válido (smartclick360, bethel360, apdireta, clickbank, whatspanel) — usado só pra autenticação'),
    },
    async ({ project }) => {
      try {
        const client = apiClient(project);
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
      project: z.string().describe('Slug do projeto pra autenticação'),
      id: z.number().describe('ID do projeto'),
    },
    async ({ project, id }) => {
      try {
        const client = apiClient(project);
        const res = await client.get(`/projects/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
