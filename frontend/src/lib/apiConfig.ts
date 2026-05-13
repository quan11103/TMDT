export const API_ORIGIN: string = (() => {
  const raw = (import.meta as any)?.env?.VITE_API_ORIGIN as string | undefined;
  const origin = (raw ?? 'http://localhost:3000').trim();
  return origin.endsWith('/') ? origin.slice(0, -1) : origin;
})();

export const API_BASE = `${API_ORIGIN}/api`;

export function apiUrl(pathOrUrl: string): string {
  const s = (pathOrUrl ?? '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${API_ORIGIN}${path}`;
}

export function apiEndpoint(path: string): string {
  const s = (path ?? '').trim();
  if (!s) return API_BASE;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/api/')) return `${API_ORIGIN}${s}`;
  if (s === '/api') return `${API_ORIGIN}/api`;
  const p = s.startsWith('/') ? s : `/${s}`;
  return `${API_BASE}${p}`;
}
