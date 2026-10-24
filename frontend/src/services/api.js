const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que el backend esté activo.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `La solicitud falló (${response.status}).`);
  return payload;
}

export const listServices = (estado = 'ACTIVO', token) => apiRequest(`/servicios?estado=${encodeURIComponent(estado)}`, { token });
