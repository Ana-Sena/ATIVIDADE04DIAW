const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(baseUrl + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      'Não foi possível conectar à Pokédex. Verifique se o servidor está disponível.',
    );
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || 'Não foi possível concluir a operação. Tente novamente.',
    );
  }
  return response.status === 204 ? null : response.json();
}
export const api = {
  pokemons: (signal) => request('/pokemons', { signal }),
  pokemon: (id) => request('/pokemons/' + id),
  types: (signal) => request('/types', { signal }),
  trainers: (signal) => request('/trainers', { signal }),
  create: (pokemon) =>
    request('/pokemons', { method: 'POST', body: JSON.stringify(pokemon) }),
  update: (pokemon) =>
    request('/pokemons/' + pokemon.id, {
      method: 'PUT',
      body: JSON.stringify(pokemon),
    }),
  remove: (id) => request('/pokemons/' + id, { method: 'DELETE' }),
};
