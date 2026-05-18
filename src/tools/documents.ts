import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerDocumentsTools(server: McpServer) {
  server.tool(
    'list_documents',
    'Lista documentos do projeto. Use ?expand=parent,blocks para incluir relações.',
    {
      project: z.string().describe('Slug do projeto'),
      parent_id: z.number().nullable().optional(),
      search: z.string().optional(),
      expand: z.string().optional().describe('Relations a expandir, separadas por vírgula: parent, blocks'),
      per_page: z.number().optional().default(100),
    },
    async ({ project, parent_id, search, expand, per_page }) => {
      try {
        const client = apiClient(project);
        const params = new URLSearchParams();
        if (parent_id !== undefined && parent_id !== null) params.set('parent_id', String(parent_id));
        if (search) params.set('search', search);
        if (expand) params.set('expand', expand);
        if (per_page) params.set('per_page', String(per_page));
        const res = await client.get(`/doc/documents?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'get_document',
    'Busca um documento específico.',
    {
      project: z.string(),
      id: z.number(),
      expand: z.string().optional(),
    },
    async ({ project, id, expand }) => {
      try {
        const client = apiClient(project);
        const q = expand ? `?expand=${expand}` : '';
        const res = await client.get(`/doc/documents/${id}${q}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'create_document',
    'Cria um novo documento.',
    {
      project: z.string(),
      title: z.string(),
      slug: z.string().describe('Slug único dentro do projeto'),
      parent_id: z.number().nullable().optional(),
      order: z.number().optional(),
      status: z.boolean().optional(),
    },
    async ({ project, ...body }) => {
      try {
        const client = apiClient(project);
        const res = await client.post('/doc/documents', body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'update_document',
    'Atualiza um documento existente.',
    {
      project: z.string(),
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      parent_id: z.number().nullable().optional(),
      order: z.number().optional(),
      status: z.boolean().optional(),
    },
    async ({ project, id, ...body }) => {
      try {
        const client = apiClient(project);
        const res = await client.put(`/doc/documents/${id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'delete_document',
    'Remove um documento (soft delete).',
    { project: z.string(), id: z.number() },
    async ({ project, id }) => {
      try {
        const client = apiClient(project);
        const res = await client.delete(`/doc/documents/${id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
