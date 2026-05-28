import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerUsersTools(server: McpServer) {

  // ─── people ──────────────────────────────────────────────────────────────

  server.tool(
    'list_people',
    'Lista todas as pessoas cadastradas no sistema.',
    {
      token:    z.string().describe(TOKEN_DESCRIBE),
      search:   z.string().optional().describe('Busca em first_name e surname'),
      per_page: z.number().int().optional().default(100),
    },
    async ({ token, search, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (search)   params.set('search', search);
        if (per_page) params.set('per_page', String(per_page));
        const res = await apiClient(token).get(`/people?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'get_person',
    'Busca uma pessoa específica pelo ID.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).get(`/people/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'create_person',
    'Cria uma nova pessoa no sistema.',
    {
      token:      z.string().describe(TOKEN_DESCRIBE),
      first_name: z.string().max(255),
      surname:    z.string().max(255),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/people', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_person',
    'Atualiza os dados de uma pessoa.',
    {
      token:      z.string().describe(TOKEN_DESCRIBE),
      id:         z.number().int(),
      first_name: z.string().max(255).optional(),
      surname:    z.string().max(255).optional(),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/people/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_person',
    'Remove (soft delete) uma pessoa do sistema.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/people/${id}`);
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
      token:    z.string().describe(TOKEN_DESCRIBE),
      search:   z.string().optional().describe('Busca por email'),
      per_page: z.number().int().optional().default(100),
    },
    async ({ token, search, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (search)   params.set('search', search);
        if (per_page) params.set('per_page', String(per_page));
        const res = await apiClient(token).get(`/users?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'get_user',
    'Busca um usuário específico pelo ID. Nunca retorna senha.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).get(`/users/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'create_user',
    'Cria um novo usuário vinculado a uma pessoa existente. A senha é hasheada pela API — nunca é retornada.',
    {
      token:     z.string().describe(TOKEN_DESCRIBE),
      person_id: z.number().int().describe('ID da pessoa existente'),
      email:     z.string().email().max(255),
      password:  z.string().min(8).describe('Senha em texto plano — a API hasheia antes de salvar'),
    },
    async ({ token, ...body }) => {
      try {
        const res = await apiClient(token).post('/users', body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'update_user',
    'Atualiza dados de um usuário. Senha é opcional (se não informada, mantém a atual). Nunca retorna senha.',
    {
      token:     z.string().describe(TOKEN_DESCRIBE),
      id:        z.number().int(),
      person_id: z.number().int().optional(),
      email:     z.string().email().max(255).optional(),
      password:  z.string().min(8).optional().describe('Nova senha em texto plano (opcional)'),
    },
    async ({ token, id, ...body }) => {
      try {
        const res = await apiClient(token).put(`/users/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );

  server.tool(
    'delete_user',
    'Remove (soft delete) um usuário do sistema.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      id:    z.number().int(),
    },
    async ({ token, id }) => {
      try {
        const res = await apiClient(token).delete(`/users/${id}`);
        if (res.status === 204) return ok({ deleted: true, id });
        return ok(handleResponse(res));
      } catch (e: any) { return err(e.message); }
    }
  );
}
