export function getTokenForProject(slug: string): string {
  const normalized = slug.toLowerCase().replace(/-/g, '');
  const envKey = `TOKEN_${normalized.toUpperCase()}_CLAUDE`;
  const token = process.env[envKey];

  if (!token) {
    const available = listAvailableProjects();
    throw new Error(
      `Projeto desconhecido: "${slug}". Projetos configurados: ${available.join(', ')}`
    );
  }

  return token;
}

export function listAvailableProjects(): string[] {
  return Object.keys(process.env)
    .filter(k => /^TOKEN_([A-Z0-9]+)_CLAUDE$/.test(k))
    .map(k => k.replace(/^TOKEN_/, '').replace(/_CLAUDE$/, '').toLowerCase());
}
