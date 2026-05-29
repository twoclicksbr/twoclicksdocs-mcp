import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

const TOKEN_DESCRIBE = 'Bearer token de autenticação (ex: "6|abc...xyz"). Cole o token do projeto nas instruções do Claude.ai e ele o repassa aqui.';

export function registerBlocksTools(server: McpServer) {
  server.tool(
    'list_document_blocks',
    'Lista blocos de um documento. Use ?expand=children pra hierarquia.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      document_id: z.number(),
      parent_id: z.number().nullable().optional(),
      search: z.string().optional(),
      expand: z.string().optional().describe('parent, children'),
      per_page: z.number().optional().default(100),
    },
    async ({ token, document_id, parent_id, search, expand, per_page }) => {
      try {
        const client = apiClient(token);
        const params = new URLSearchParams();
        if (parent_id !== undefined && parent_id !== null) params.set('parent_id', String(parent_id));
        if (search) params.set('search', search);
        if (expand) params.set('expand', expand);
        if (per_page) params.set('per_page', String(per_page));
        const res = await client.get(`/doc/documents/${document_id}/blocks?${params}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'create_document_block',
    'Cria um bloco de conteúdo em um documento.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      document_id: z.number(),
      content: z.string().describe('Texto do bloco'),
      parent_id: z.number().nullable().optional(),
      order: z.number().optional(),
    },
    async ({ token, document_id, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.post(`/doc/documents/${document_id}/blocks`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'update_document_block',
    'Atualiza um bloco.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      document_id: z.number(),
      block_id: z.number(),
      content: z.string().optional(),
      parent_id: z.number().nullable().optional(),
      order: z.number().optional(),
    },
    async ({ token, document_id, block_id, ...body }) => {
      try {
        const client = apiClient(token);
        const res = await client.put(`/doc/documents/${document_id}/blocks/${block_id}`, body);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  server.tool(
    'delete_document_block',
    'Remove um bloco.',
    {
      token: z.string().describe(TOKEN_DESCRIBE),
      document_id: z.number(),
      block_id: z.number(),
    },
    async ({ token, document_id, block_id }) => {
      try {
        const client = apiClient(token);
        const res = await client.delete(`/doc/documents/${document_id}/blocks/${block_id}`);
        return ok(handleResponse(res));
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}
