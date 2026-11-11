import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  selectPokemon,
  resolveTeam,
  trainersFor,
  globalStatMax,
  flipPokemon,
} from '../src/utils/pokemonSelectors.js';
const data = JSON.parse(
  readFileSync(new URL('../src/data/pokedex-data.json', import.meta.url)),
);
test('cópia textual preserva o JSON original', () =>
  assert.deepEqual(
    readFileSync('pokedex-data.json'),
    readFileSync('src/data/pokedex-data.json'),
  ));
test('busca parcial e ID exato, combinados com tipo secundário', () => {
  for (const query of ['25', '025', '#025'])
    assert.deepEqual(
      selectPokemon(data.pokemon, { query }).map((p) => p.id),
      [25],
    );
  assert.equal(selectPokemon(data.pokemon, { query: ' BulBA ' })[0].id, 1);
  assert.equal(
    selectPokemon(data.pokemon, { query: 'bulba', type: 8 })[0].id,
    1,
  );
  assert.equal(
    selectPokemon(data.pokemon, { query: 'bulba', type: 2 }).length,
    0,
  );
});
test('ordena numericamente todos os atributos sem alterar dados', () => {
  const before = JSON.stringify(data);
  for (const sort of ['id', 'name', ...Object.keys(data.pokemon[0].stats)]) {
    for (const direction of ['asc', 'desc']) {
      const list = selectPokemon(data.pokemon, { sort, direction });
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1],
          b = list[i];
        const diff =
          sort === 'name'
            ? a.name.localeCompare(b.name, 'pt-BR')
            : sort === 'id'
              ? a.id - b.id
              : a.stats[sort] - b.stats[sort];
        assert.ok(direction === 'asc' ? diff <= 0 : diff >= 0);
        if (!diff) assert.ok(a.id < b.id);
      }
    }
  }
  assert.equal(JSON.stringify(data), before);
});
test('equipes preservam posições repetidas sem duplicar treinadores', () => {
  for (const trainer of data.trainers) {
    assert.deepEqual(
      resolveTeam(trainer, data.pokemon).map((p) => p.id),
      trainer.pokemonIds,
    );
    for (const id of trainer.pokemonIds)
      assert.equal(
        trainersFor(id, data.trainers).filter((t) => t.id === trainer.id)
          .length,
        1,
      );
  }
  assert.match(
    resolveTeam({ pokemonIds: [99999] }, data.pokemon)[0].name,
    /indisponível/,
  );
});
test('tipos vazios e escala global', () => {
  assert.equal(
    selectPokemon([{ id: 1, name: 'Teste', types: [], stats: {} }], { type: 0 })
      .length,
    0,
  );
  assert.equal(
    globalStatMax(data.pokemon),
    Math.max(...data.pokemon.flatMap((p) => Object.values(p.stats))),
  );
});
test('transições das cartas não restauram contextos anteriores', () => {
  let state = flipPokemon(new Set(), null, 1);
  state = flipPokemon(state.flipped, state.panelId, 2);
  assert.deepEqual([...state.flipped], [1, 2]);
  state = flipPokemon(state.flipped, state.panelId, 1);
  assert.equal(state.panelId, 2);
  state = flipPokemon(state.flipped, null, 1);
  assert.equal(state.panelId, 1);
  state = flipPokemon(state.flipped, state.panelId, 1);
  assert.equal(state.panelId, null);
  assert.ok(state.flipped.has(2));
});
