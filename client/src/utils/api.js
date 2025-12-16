export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const base = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
  const url = path.startsWith('http') ? path : `${base}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = typeof data === 'object' && data && data.error ? data.error : 'Request failed';
    throw new Error(msg);
  }

  return data;
}
