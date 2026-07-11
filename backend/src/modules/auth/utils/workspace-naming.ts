/**
 * Builds a URL-safe unique slug from a display name.
 */
export function buildWorkspaceSlug(name: string, uniqueSuffix: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  const suffix = uniqueSuffix.replace(/-/g, '').slice(0, 8).toLowerCase();
  return `${base || 'workspace'}-${suffix}`;
}

/**
 * Default personal workspace name derived from the owner's full name.
 */
export function buildDefaultWorkspaceName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? 'My';
  return `${first}'s Workspace`;
}
