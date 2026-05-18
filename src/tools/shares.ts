import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient, handleResponse } from '../api/client.js';
import { ok, err } from '../lib/format.js';

export function registerSharesTools(server: McpServer) {
  server.tool(
    'resolve_share',
    'Resolve um link compartilhado do painel (hash de 10 chars) e retorna o estado completo: projeto, aba ativa, filtros aplicados e recurso aberto (documento ou tarefa). Use isso quando o usuário colar um link no formato https://docs.twoclicks.com.br/painel?h=XXXXXXXXXX. Após resolver, chame get_document ou get_task com os IDs retornados se quiser ver o conteúdo.',
    {
      hash: z.string().min(8).max(15).describe('Hash do share (extraído do parâmetro ?h= da URL)'),
      project: z.string().describe('Slug de qualquer projeto válido (smartclick360, bethel360, apdireta, clickbank, whatspanel) — só para autenticação. O share retornará o projeto real ao qual pertence.'),
    },
    async ({ hash, project }) => {
      try {
        const client = apiClient(project);
        const res = await client.get(`/shares/${hash}`);
        const data = handleResponse(res);

        const share = data.data || data;
        const payload = share.payload || {};
        const proj = share.project || {};

        const result: any = {
          hash: share.hash,
          project: {
            id: proj.id,
            name: proj.name,
            slug: proj.slug,
          },
          tab: payload.tab || 'documentacao',
          filters: payload.filters || {},
          resource: payload.resource || null,
          created_at: share.created_at,
          expires_at: share.expires_at,
        };

        let summary = `Share resolvido: projeto ${proj.name} (${proj.slug}), aba "${result.tab}".`;
        if (result.resource) {
          summary += ` Recurso: ${result.resource.type} id ${result.resource.id}.`;
          summary += ` Use ${result.resource.type === 'doc' ? 'get_document' : 'get_task'} com project="${proj.slug}" e id=${result.resource.id} para ver o conteúdo.`;
        }
        if (Object.keys(result.filters).length > 0) {
          summary += ` Filtros: ${JSON.stringify(result.filters)}.`;
        }

        return ok({ summary, ...result });
      } catch (e: any) {
        return err(`Erro ao resolver share: ${e.message}`);
      }
    }
  );
}
