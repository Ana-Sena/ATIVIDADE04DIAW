export const statLabels = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  specialAttack: 'Ataque Especial',
  specialDefense: 'Defesa Especial',
  speed: 'Velocidade',
};
export const typeLabels = {
  Typeless: 'Sem tipo',
  Normal: 'Normal',
  Fire: 'Fogo',
  Water: 'Água',
  Grass: 'Planta',
  Electric: 'Elétrico',
  Ice: 'Gelo',
  Fighting: 'Lutador',
  Poison: 'Veneno',
  Ground: 'Terra',
  Flying: 'Voador',
  Psychic: 'Psíquico',
  Bug: 'Inseto',
  Rock: 'Pedra',
  Ghost: 'Fantasma',
  Dark: 'Sombrio',
  Dragon: 'Dragão',
  Steel: 'Aço',
  Fairy: 'Fada',
};
export const formatId = (id) => `#${String(id).padStart(3, '0')}`;
export const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Number(id)}.png`;

export function selectPokemon(
  pokemon,
  { query = '', type = '', sort = 'id', direction = 'asc' } = {},
) {
  const search = query.trim().toLowerCase();
  const numeric = /^#?\d+$/.test(search);
  return pokemon
    .filter(
      (p) =>
        (!search ||
          (numeric
            ? p.id === Number(search.replace('#', ''))
            : p.name.toLowerCase().includes(search))) &&
        (type === '' || p.types.some((t) => String(t.id) === String(type))),
    )
    .sort((a, b) => {
      const comparison =
        sort === 'name'
          ? a.name.localeCompare(b.name, 'pt-BR')
          : sort === 'id'
            ? a.id - b.id
            : a.stats[sort] - b.stats[sort];
      return comparison * (direction === 'desc' ? -1 : 1) || a.id - b.id;
    });
}
export const resolveTeam = (trainer, pokemon) =>
  trainer.pokemonIds.map(
    (id) =>
      pokemon.find((p) => p.id === id) ?? {
        id,
        name: `Pokémon ${formatId(id)} indisponível`,
        types: [],
      },
  );
export const trainersFor = (id, trainers) =>
  trainers.filter((t) => t.pokemonIds.includes(id));
export const globalStatMax = (pokemon) =>
  Math.max(1, ...pokemon.flatMap((p) => Object.values(p.stats)));

// A carta e o painel são independentes: fechar o painel nunca muda as cartas.
export function flipPokemon(flipped, panelId, id) {
  const next = new Set(flipped);
  if (next.has(id)) {
    next.delete(id);
    return { flipped: next, panelId: panelId === id ? null : panelId };
  }
  next.add(id);
  return { flipped: next, panelId: id };
}
