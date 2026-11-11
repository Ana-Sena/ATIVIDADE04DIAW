import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Lê apenas os INSERTs do formato fornecido, sem executar SQL nem usar MySQL.
export function convertSql(sql) {
  const tables = {};
  for (const match of sql.matchAll(
    /INSERT\s+INTO\s+(\w+)\s*\([^;]*?\)\s*VALUES\s*([\s\S]*?);/gi,
  )) {
    tables[match[1]] = [...match[2].matchAll(/\(([^()]*)\)/g)].map((row) => {
      const tokens = row[1].match(/'(?:[^']|'')*'|-?\d+/g) ?? [];
      return tokens.map((v) =>
        v.startsWith("'") ? v.slice(1, -1).replaceAll("''", "'") : Number(v),
      );
    });
  }
  for (const name of [
    'Pokemon',
    'Types',
    'Trainers',
    'Rel_Pokemon_Type',
    'Rel_Trainer_Pokemon',
  ]) {
    if (!tables[name]?.length)
      throw new Error('Tabela ausente ou vazia: ' + name);
  }
  const types = tables.Types.map(([id, name]) => ({ id, name }));
  const keys = [
    'hp',
    'attack',
    'defense',
    'specialAttack',
    'specialDefense',
    'speed',
  ];
  const pokemon = tables.Pokemon.map(([id, name, ...values]) => ({
    id,
    name,
    stats: Object.fromEntries(keys.map((key, i) => [key, values[i]])),
    types: tables.Rel_Pokemon_Type.filter(
      ([pokemonId]) => pokemonId === id,
    ).map(([, typeId]) => {
      const type = types.find((t) => t.id === typeId);
      if (!type) throw new Error('Tipo desconhecido: ' + typeId);
      return type;
    }),
  }));
  const trainers = tables.Trainers.map(([id, name, badges]) => ({
    id,
    name,
    badges,
    // Repetições são parte das equipes originais e devem ser mantidas.
    pokemonIds: tables.Rel_Trainer_Pokemon.filter(
      ([trainerId]) => trainerId === id,
    ).map(([, pokemonId]) => pokemonId),
  }));
  return { pokemon, types, trainers };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const data = convertSql(
    await readFile(path.join(root, 'database/seed/Script_Pokedex.sql'), 'utf8'),
  );
  const target = path.join(
    root,
    'backend/src/main/resources/seed/pokedex.json',
  );
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(data, null, 2) + '\n');
  console.log(
    'SQL convertido: ' +
      data.pokemon.length +
      ' Pokémon, ' +
      data.types.length +
      ' tipos e ' +
      data.trainers.length +
      ' treinadores.',
  );
}
