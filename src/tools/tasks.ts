import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerTasksTools(server: McpServer) {
  server.tool(
    'list_tasks',
    'Lista tarefas do projeto. Filtros: task_status_id, task_fase_id, task_modulo_id, task_tipo_id, task_prioridade_id, priority_flag. Use expand=status,fase,modulo,tipo,prioridade,details.',
    {
      project: z.string(),
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
    async ({ project, ...filters }) => {
      try {
        const client = apiClient(project);
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
      project: z.string(),
      id: z.number(),
      expand: z.string().optional(),
    },
    async ({ project, id, expand }) => {
      try {
        const client = apiClient(project);
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
      project: z.string(),
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
    async ({ project, ...body }) => {
      try {
        const client = apiClient(project);
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
      project: z.string(),
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
    async ({ project, id, ...body }) => {
      try {
        const client = apiClient(project);
        const res = await client.put(`/doc/tasks/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'delete_task',
    'Remove uma tarefa.',
    { project: z.string(), id: z.number() },
    async ({ project, id }) => {
      try {
        const client = apiClient(project);
        const res = await client.delete(`/doc/tasks/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
