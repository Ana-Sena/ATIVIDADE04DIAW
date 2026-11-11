import { typeLabels } from '../utils/pokemonSelectors.js';
export default function TypeBadge({ types }) {
  return (
    <span className="types">
      {types.length ? (
        types.map((type) => (
          <span
            className={`type type-${type.name.toLowerCase()}`}
            key={type.id}
          >
            {typeLabels[type.name] || type.name}
          </span>
        ))
      ) : (
        <span className="type">Tipo não informado</span>
      )}
    </span>
  );
}
