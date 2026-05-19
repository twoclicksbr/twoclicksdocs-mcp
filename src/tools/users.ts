import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerUsersTools(server: McpServer) {

  // ─── people ──────────────────────────────────────────────────────────────

  server.tool(
    'list_people',
    'Lista todas as pessoas cadastradas no sistema.',
    {
      project:    z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      search:     z.string().optional().describe('Busca em first_name e surname'),
      per_page:   z.number().int().optional().default(100),
    },
    async ({ project, search, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (search)   params.set('search', search);
        if (per_page) params.set('per_page', String(per_page));
        const res = await apiClient(project).get(`/people?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'get_person',
    'Busca uma pessoa específica pelo ID.',
    {
      project: z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:      z.number().int(),
    },
    async ({ project, id }) => {
      try {
        const res = await apiClient(project).get(`/people/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'create_person',
    'Cria uma nova pessoa no sistema.',
    {
      project:    z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      first_name: z.string().max(255),
      surname:    z.string().max(255),
    },
    async ({ project, ...body }) => {
      try {
        const res = await apiClient(project).post('/people', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_person',
    'Atualiza os dados de uma pessoa.',
    {
      project:    z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:         z.number().int(),
      first_name: z.string().max(255).optional(),
      surname:    z.string().max(255).optional(),
    },
    async ({ project, id, ...body }) => {
      try {
        const res = await apiClient(project).put(`/people/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_person',
    'Remove (soft delete) uma pessoa do sistema.',
    {
      project: z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:      z.number().int(),
    },
    async ({ project, id }) => {
      try {
        const res = await apiClient(project).delete(`/people/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  // ─── users ───────────────────────────────────────────────────────────────

  server.tool(
    'list_users',
    'Lista todos os usuários do sistema. Nunca retorna senhas.',
    {
      project:  z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      search:   z.string().optional().describe('Busca por email'),
      per_page: z.number().int().optional().default(100),
    },
    async ({ project, search, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (search)   params.set('search', search);
        if (per_page) params.set('per_page', String(per_page));
        const res = await apiClient(project).get(`/users?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'get_user',
    'Busca um usuário específico pelo ID. Nunca retorna senha.',
    {
      project: z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:      z.number().int(),
    },
    async ({ project, id }) => {
      try {
        const res = await apiClient(project).get(`/users/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'create_user',
    'Cria um novo usuário vinculado a uma pessoa existente. A senha é hasheada pela API — nunca é retornada.',
    {
      project:   z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      person_id: z.number().int().describe('ID da pessoa existente'),
      email:     z.string().email().max(255),
      password:  z.string().min(8).describe('Senha em texto plano — a API hasheia antes de salvar'),
    },
    async ({ project, ...body }) => {
      try {
        const res = await apiClient(project).post('/users', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_user',
    'Atualiza dados de um usuário. Senha é opcional (se não informada, mantém a atual). Nunca retorna senha.',
    {
      project:   z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:        z.number().int(),
      person_id: z.number().int().optional(),
      email:     z.string().email().max(255).optional(),
      password:  z.string().min(8).optional().describe('Nova senha em texto plano (opcional)'),
    },
    async ({ project, id, ...body }) => {
      try {
        const res = await apiClient(project).put(`/users/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_user',
    'Remove (soft delete) um usuário do sistema.',
    {
      project: z.string().describe('Slug de qualquer projeto válido (para autenticação)'),
      id:      z.number().int(),
    },
    async ({ project, id }) => {
      try {
        const res = await apiClient(project).delete(`/users/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );
}
