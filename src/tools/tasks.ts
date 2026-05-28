import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerTasksTools(server: McpServer) {
  server.tool(
    'list_tasks',
    'Lista tarefas do projeto. Filtros: task_status_id, task_fase_id, task_modulo_id, task_tipo_id, task_prioridade_id, priority_flag. Use expand=status,fase,modulo,tipo,prioridade,details.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      task_status_id: z.number().optional(),
      task_fase_id: z.number().optional(),
      task_modulo_id: z.number().optional(),
      task_tipo_id: z.number().optional(),
      task_prioridade_id: z.number().optional(),
      priority_flag: z.boolean().optional(),
      search: z.string().optional(),
      expand: z.string().optional(),
      per_page: z.number().optional().default(100),
    },
    async ({ token, ...filters }) => {
      try {
        const client = apiClient(token);
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== null) params.set(k, String(v));
        }
        const res = await client.get(`/doc/tasks?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'get_task',
    'Busca uma tarefa específica.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id: z.number(),
      expand: z.string().optional(),
    },
    async ({ token, id, expand }) => {
      try {
        const client = apiClient(token);
        const q = expand ? `?expand=${expand}` : '';
        const res = await client.get(`/doc/tasks/${id}${q}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'create_task',
    'Cria uma nova tarefa. priority_flag=true marca como retrabalho/prioridade de fila.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      title: z.string(),
      description: z.string().optional(),
      task_status_id: z.number(),
      task_fase_id: z.number(),
      task_modulo_id: z.number(),
      task_tipo_id: z.number(),
      task_prioridade_id: z.number(),
      order: z.number().optional(),
      priority_flag: z.boolean().optional().default(false),
    },
    async ({ token, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.post('/doc/tasks', body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'update_task',
    'Atualiza uma tarefa existente.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      task_status_id: z.number().optional(),
      task_fase_id: z.number().optional(),
      task_modulo_id: z.number().optional(),
      task_tipo_id: z.number().optional(),
      task_prioridade_id: z.number().optional(),
      order: z.number().optional(),
      status: z.boolean().optional(),
      priority_flag: z.boolean().optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.put(`/doc/tasks/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'bulk_create_tasks',
    'Cria múltiplas tarefas em uma única requisição (batch INSERT). Até 500x mais rápido que chamadas sequenciais. Use sempre que criar 2 ou mais tarefas de uma vez.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      tasks: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        task_status_id: z.number(),
        task_fase_id: z.number(),
        task_modulo_id: z.number(),
        task_tipo_id: z.number(),
        task_prioridade_id: z.number(),
        priority_flag: z.boolean().optional().default(false),
        order: z.number().optional(),
      })).min(1).max(500),
    },
    async ({ token, tasks }) => {
      try {
        const client = apiClient(token);
        const res = await client.post('/doc/tasks/bulk', { tasks });
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'delete_task',
    'Remove uma tarefa.',
    { token: z.string().describe(TOKEN_DESCRIBE), id: z.number() },
    async ({ token, id }) => {
      try {
        const client = apiClient(token);
        const res = await client.delete(`/doc/tasks/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'bulk_move_tasks_modulo',
    'Move múltiplas tarefas para um módulo diferente em uma única operação. Até 500 tarefas por chamada.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      task_ids: z.array(z.number()).min(1).max(500),
      task_modulo_id: z.number(),
    },
    async ({ token, task_ids, task_modulo_id }) => {
      try {
        const client = apiClient(token);
        const res = await client.patch('/doc/tasks/bulk-move-modulo', { task_ids, task_modulo_id });
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
