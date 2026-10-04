export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  if (url.startsWith('/uploads/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname;
    }
  } catch {
    return url;
  }

  return url;
}
