import assert from 'node:assert/strict';
import { randomInt } from 'node:crypto';
const base = (process.env.API_URL || 'http://localhost:8080/api').replace(
  /\/$/,
  '',
);
async function call(path, method = 'GET', body) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return {
    status: response.status,
    body: response.status === 204 ? null : await response.json(),
  };
}
const listing = await call('/pokemons');
assert.equal(listing.status, 200);
assert.ok(Array.isArray(listing.body));
const types = await call('/types');
assert.equal(types.status, 200);
assert.ok(types.body.length > 0);
const trainers = await call('/trainers');
assert.equal(trainers.status, 200);
const id = randomInt(100000, 2000000000);
assert.equal(
  (await call('/pokemons/' + id)).status,
  404,
  'ID temporário já está em uso',
);
const pokemon = {
  id,
  name: 'Teste temporário',
  stats: {
    hp: 45,
    attack: 49,
    defense: 65,
    specialAttack: 49,
    specialDefense: 65,
    speed: 45,
  },
  typeIds: [types.body[0].id],
};
let created = false;
try {
  const result = await call('/pokemons', 'POST', pokemon);
  assert.equal(result.status, 201);
  created = true;
  assert.equal((await call('/pokemons/' + id)).body.name, pokemon.name);
  assert.equal((await call('/pokemons', 'POST', pokemon)).status, 409);
  assert.equal(
    (
      await call('/pokemons/' + id, 'PUT', {
        ...pokemon,
        stats: { ...pokemon.stats, hp: -1 },
      })
    ).status,
    400,
  );
  const updated = await call('/pokemons/' + id, 'PUT', {
    ...pokemon,
    name: 'Teste atualizado',
  });
  assert.equal(updated.status, 200);
  assert.equal((await call('/pokemons/' + id)).body.name, 'Teste atualizado');
  assert.ok(
    (
      await call('/pokemons?name=Teste%20atualizado&type=' + pokemon.typeIds[0])
    ).body.some((p) => p.id === id),
  );
  assert.equal((await call('/pokemons/' + id, 'DELETE')).status, 204);
  created = false;
  assert.equal((await call('/pokemons/' + id)).status, 404);
  console.log(
    'API + MongoDB: listagem, detalhes, cadastro, conflito, validação, edição, filtros e exclusão OK.',
  );
} finally {
  if (created) await call('/pokemons/' + id, 'DELETE');
}
