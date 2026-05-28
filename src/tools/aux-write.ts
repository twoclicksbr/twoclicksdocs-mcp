import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerAuxWriteTools(server: McpServer) {

  // ─── task_statuses ───────────────────────────────────────────────────────

  server.tool(
    'create_task_status',
    'Cria um novo status de tarefa no projeto.',
    {
      token:                z.string().describe(TOKEN_DESCRIBE),
      name:                 z.string().max(50),
      slug:                 z.string().max(50),
      color:                z.string().max(20).optional().describe('Cor em hex, ex: #ff0000'),
      order:                z.number().int().optional().default(0),
      status:               z.boolean().optional().default(true).describe('Ativo?'),
      model:                z.enum(['opus', 'sonnet']).optional().describe('Modelo LLM associado ao status'),
      runtime_location:     z.enum(['vps', 'local']).optional().describe('Onde o Code roda quando processa este status'),
      webhook_url:          z.string().url().max(500).optional().describe('URL pra disparar webhook na transição'),
      code_prompt:          z.string().optional().describe('Prompt do Code (placeholder {task_id} é substituído pelo ID)'),
      show_on_task:         z.boolean().optional().describe('Aparece nos checkboxes do form de tarefa?'),
      auto_execute_default: z.boolean().optional().describe('Auto-executar webhook em toda task (status \"alwaysAuto\")'),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/doc/task-statuses', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_task_status',
    'Atualiza um status de tarefa existente no projeto.',
    {
      token:                z.string().describe(TOKEN_DESCRIBE),
      id:                   z.number().int(),
      name:                 z.string().max(50).optional(),
      slug:                 z.string().max(50).optional(),
      color:                z.string().max(20).optional(),
      order:                z.number().int().optional(),
      status:               z.boolean().optional(),
      model:                z.enum(['opus', 'sonnet']).optional().describe('Modelo LLM associado ao status'),
      runtime_location:     z.enum(['vps', 'local']).optional().describe('Onde o Code roda quando processa este status'),
      webhook_url:          z.string().url().max(500).optional().describe('URL pra disparar webhook na transição'),
      code_prompt:          z.string().optional().describe('Prompt do Code (placeholder {task_id} é substituído pelo ID)'),
      show_on_task:         z.boolean().optional().describe('Aparece nos checkboxes do form de tarefa?'),
      auto_execute_default: z.boolean().optional().describe('Auto-executar webhook em toda task (status \"alwaysAuto\")'),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/doc/task-statuses/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_task_status',
    'Remove (soft delete) um status de tarefa do projeto.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/doc/task-statuses/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  // ─── task_fases ──────────────────────────────────────────────────────────

  server.tool(
    'create_task_fase',
    'Cria uma nova fase de tarefa no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      name:   z.string().max(100),
      slug:   z.string().max(50),
      order:  z.number().int().optional().default(0),
      status: z.boolean().optional().default(true),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/doc/task-fases', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_task_fase',
    'Atualiza uma fase de tarefa existente no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      id:     z.number().int(),
      name:   z.string().max(100).optional(),
      slug:   z.string().max(50).optional(),
      order:  z.number().int().optional(),
      status: z.boolean().optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/doc/task-fases/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_task_fase',
    'Remove (soft delete) uma fase de tarefa do projeto.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/doc/task-fases/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  // ─── task_modulos ────────────────────────────────────────────────────────

  server.tool(
    'create_task_modulo',
    'Cria um novo módulo de tarefa no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      name:   z.string().max(50),
      slug:   z.string().max(50),
      order:  z.number().int().optional().default(0),
      status: z.boolean().optional().default(true),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/doc/task-modulos', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_task_modulo',
    'Atualiza um módulo de tarefa existente no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      id:     z.number().int(),
      name:   z.string().max(50).optional(),
      slug:   z.string().max(50).optional(),
      order:  z.number().int().optional(),
      status: z.boolean().optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/doc/task-modulos/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_task_modulo',
    'Remove (soft delete) um módulo de tarefa do projeto.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/doc/task-modulos/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  // ─── task_tipos ──────────────────────────────────────────────────────────

  server.tool(
    'create_task_tipo',
    'Cria um novo tipo de tarefa no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      name:   z.string().max(50),
      slug:   z.string().max(50),
      order:  z.number().int().optional().default(0),
      status: z.boolean().optional().default(true),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/doc/task-tipos', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_task_tipo',
    'Atualiza um tipo de tarefa existente no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      id:     z.number().int(),
      name:   z.string().max(50).optional(),
      slug:   z.string().max(50).optional(),
      order:  z.number().int().optional(),
      status: z.boolean().optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/doc/task-tipos/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_task_tipo',
    'Remove (soft delete) um tipo de tarefa do projeto.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/doc/task-tipos/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  // ─── task_prioridades ────────────────────────────────────────────────────

  server.tool(
    'create_task_prioridade',
    'Cria uma nova prioridade de tarefa no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      name:   z.string().max(20),
      slug:   z.string().max(20),
      color:  z.string().max(20).optional().describe('Cor em hex, ex: #ff0000'),
      order:  z.number().int().optional().default(0),
      status: z.boolean().optional().default(true),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/doc/task-prioridades', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_task_prioridade',
    'Atualiza uma prioridade de tarefa existente no projeto.',
    {
      token:  z.string().describe(TOKEN_DESCRIBE),
      id:     z.number().int(),
      name:   z.string().max(20).optional(),
      slug:   z.string().max(20).optional(),
      color:  z.string().max(20).optional(),
      order:  z.number().int().optional(),
      status: z.boolean().optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/doc/task-prioridades/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_task_prioridade',
    'Remove (soft delete) uma prioridade de tarefa do projeto.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/doc/task-prioridades/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );
}
