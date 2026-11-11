export default function ImageWithFallback({
  src,
  alt,
  fallback = '/images/pokemon-fallback.svg',
  className = '',
}) {
  return (
    <img
      className={className}
      src={src || fallback}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget;
        if (img.dataset.failed) return;
        img.dataset.failed = 'true';
        img.src = fallback;
      }}
    />
  );
}
