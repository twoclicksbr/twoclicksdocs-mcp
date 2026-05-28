import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

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
      { token: z.string().describe(TOKEN_DESCRIBE) },
      async ({ token }) => {
        try {
          const client = apiClient(token);
          const res = await client.get(`/doc/${path}`);
          return ok(handleResponse(res));
        } catch (e: any) {
          return err(e.message);
        }
      }
    );
  }
}
