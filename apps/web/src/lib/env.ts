function parseApiBaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL.');
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL must be an HTTP(S) URL without credentials, a query, or a fragment.',
    );
  }

  return url.toString().replace(/\/+$/, '');
}

export const env = Object.freeze({
  apiBaseUrl: parseApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  ),
});
