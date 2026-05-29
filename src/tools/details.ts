import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerDetailsTools(server: McpServer) {
  server.tool(
    'list_task_details',
    'Lista detalhes (ciclos de execução) de uma tarefa.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      task_id: z.number(),
      expand: z.string().optional().describe('status, person, task'),
      per_page: z.number().optional().default(100),
    },
    async ({ token, task_id, expand, per_page }) => {
      try {
        const client = apiClient(token);
        const params = new URLSearchParams();
        if (expand) params.set('expand', expand);
        if (per_page) params.set('per_page', String(per_page));
        const res = await client.get(`/doc/tasks/${task_id}/details?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'create_task_detail',
    'Cria um novo ciclo de execução em uma tarefa. duration_minutes é calculado automaticamente.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      task_id: z.number(),
      task_status_id: z.number(),
      person_id: z.number(),
      prompt: z.string(),
      resumo: z.string().optional(),
      started_at: z.string().optional().describe('ISO 8601 (ex: 2026-05-18T01:00:00)'),
      finished_at: z.string().optional(),
    },
    async ({ token, task_id, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.post(`/doc/tasks/${task_id}/details`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'update_task_detail',
    'Atualiza um detalhe (uso emergencial — em geral details são append-only).',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      task_id: z.number(),
      detail_id: z.number(),
      task_status_id: z.number().optional(),
      person_id: z.number().optional(),
      prompt: z.string().optional(),
      resumo: z.string().optional(),
      started_at: z.string().optional(),
      finished_at: z.string().optional(),
    },
    async ({ token, task_id, detail_id, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.put(`/doc/tasks/${task_id}/details/${detail_id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
