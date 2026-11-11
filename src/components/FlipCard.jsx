export default function FlipCard({
  id,
  name,
  flipped,
  onFlip,
  front,
  back,
  className = '',
  style,
}) {
  return (
    <button
      id={id}
      type="button"
      className={`flip-card ${className} ${flipped ? 'is-flipped' : ''}`}
      style={style}
      aria-label={`${name}: ${flipped ? 'ocultar detalhes' : 'ver detalhes'}`}
      aria-pressed={flipped}
      aria-describedby={flipped && id ? `${id}-details` : undefined}
      onClick={onFlip}
    >
      <span className="card-rotator">
        <span
          className="card-face card-front"
          aria-hidden={flipped}
          inert={flipped}
        >
          {front}
        </span>
        <span
          id={id ? `${id}-details` : undefined}
          className="card-face card-back"
          aria-hidden={!flipped}
          inert={!flipped}
        >
          {back}
        </span>
      </span>
    </button>
  );
}
