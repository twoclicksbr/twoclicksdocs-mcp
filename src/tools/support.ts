import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerSupportTools(server: McpServer) {
  const endpoints = [
    ['list_task_statuses', 'task-statuses', 'Lista os status disponíveis para tarefas.'],
    ['list_task_fases', 'task-fases', 'Lista as fases disponíveis.'],
    ['list_task_modulos', 'task-modulos', 'Lista os módulos disponíveis.'],
    ['list_task_tipos', 'task-tipos', 'Lista os tipos disponíveis.'],
    ['list_task_prioridades', 'task-prioridades', 'Lista as prioridades disponíveis.'],
  ] as const;

  for (const [name, path, desc] of endpoints) {
    server.tool(
      name,
      desc,
      { project: z.string().describe('Slug de qualquer projeto válido (só pra auth)') },
      async ({ project }) => {
        try {
          const client = apiClient(project);
          const res = await client.get(`/doc/${path}`);
          return ok(handleResponse(res));
        } catch (e: any) {
          return err(e.message);
        }
      }
    );
  }
}
