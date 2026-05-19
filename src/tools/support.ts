import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerSupportTools(server: McpServer) {
  const endpoints = [
    ['list_task_statuses', 'task-statuses', 'Lista os status disponíveis para tarefas do projeto.'],
    ['list_task_fases', 'task-fases', 'Lista as fases disponíveis para o projeto.'],
    ['list_task_modulos', 'task-modulos', 'Lista os módulos disponíveis para o projeto.'],
    ['list_task_tipos', 'task-tipos', 'Lista os tipos disponíveis para o projeto.'],
    ['list_task_prioridades', 'task-prioridades', 'Lista as prioridades disponíveis para o projeto.'],
  ] as const;

  for (const [name, path, desc] of endpoints) {
    server.tool(
      name,
      desc,
      { project: z.string().describe('Slug do projeto (filtra os registros pelo projeto)') },
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
