import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { convertSql } from '../scripts/convert-sql.mjs';
const sql = readFileSync('Script_Pokedex.sql', 'utf8');
const data = convertSql(sql);
test('carga MongoDB é reproduzível exclusivamente a partir do SQL fornecido', () => {
  assert.deepEqual(
    data,
    JSON.parse(
      readFileSync('backend/src/main/resources/seed/pokedex.json', 'utf8'),
    ),
  );
  assert.equal(data.pokemon.length, 151);
  assert.equal(data.types.length, 18);
  assert.equal(data.trainers.length, 12);
});
test('preserva apóstrofos, atributos, tipos ausentes e repetições das equipes', () => {
  assert.equal(data.pokemon.find((p) => p.id === 83).name, "Farfetch'd");
  assert.equal(data.pokemon.find((p) => p.id === 25).stats.defense, 30);
  assert.deepEqual(data.pokemon.find((p) => p.id === 151).types, []);
  assert.deepEqual(
    data.trainers.find((t) => t.id === 6).pokemonIds,
    [48, 48, 48, 49],
  );
});
test('recusa um script incompleto', () =>
  assert.throws(() => convertSql(''), /Tabela ausente/));
