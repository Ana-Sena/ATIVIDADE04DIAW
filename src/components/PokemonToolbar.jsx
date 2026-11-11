import { statLabels, typeLabels } from '../utils/pokemonSelectors.js';
export default function PokemonToolbar({
  filters,
  onChange,
  types,
  count,
  total,
  onClear,
}) {
  return (
    <section className="toolbar" aria-label="Pesquisa e organização">
      <div className="toolbar-fields">
        <label className="search-field">
          Buscar por nome ou ID
          <span className="search-input">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={filters.query}
              placeholder="Ex.: Bulbasaur ou #025"
              onChange={(e) => onChange('query', e.target.value)}
            />
          </span>
        </label>
        <label>
          Tipo
          <select
            value={filters.type}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {typeLabels[t.name] || t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ordenar por
          <select
            value={filters.sort}
            onChange={(e) => onChange('sort', e.target.value)}
          >
            {Object.entries({ id: 'Número', name: 'Nome', ...statLabels }).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Ordem
          <select
            value={filters.direction}
            onChange={(e) => onChange('direction', e.target.value)}
          >
            <option value="asc">Crescente ↑</option>
            <option value="desc">Decrescente ↓</option>
          </select>
        </label>
      </div>
      <div className="results-line">
        <p aria-live="polite">
          <strong>{count}</strong> de {total} Pokémon
        </p>
        <button className="text-button" onClick={onClear}>
          Limpar filtros
        </button>
      </div>
    </section>
  );
}
