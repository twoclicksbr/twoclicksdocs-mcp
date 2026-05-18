const projects = ['smartclick360', 'bethel360', 'apdireta', 'clickbank', 'whatspanel'] as const;

export type ProjectSlug = typeof projects[number];

export function getTokenForProject(slug: string): string {
  const normalized = slug.toLowerCase().replace(/-/g, '');

  if (!projects.includes(normalized as ProjectSlug)) {
    throw new Error(
      `Projeto desconhecido: "${slug}". Projetos disponíveis: ${projects.join(', ')}`
    );
  }

  const envKey = `TOKEN_${normalized.toUpperCase()}_CLAUDE`;
  const token = process.env[envKey];

  if (!token) {
    throw new Error(
      `Token não configurado para "${slug}". Defina ${envKey} no .env`
    );
  }

  return token;
}

export function listAvailableProjects(): readonly string[] {
  return projects;
}
