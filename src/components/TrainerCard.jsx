import FlipCard from './FlipCard.jsx';
import ImageWithFallback from './ImageWithFallback.jsx';
import TeamPreview from './TeamPreview.jsx';
import { trainerImages, trainerFallback } from '../data/trainerImages.js';
export default function TrainerCard({ trainer, pokemon, flipped, onFlip }) {
  return (
    <FlipCard
      id={`trainer-${trainer.id}`}
      name={trainer.name}
      flipped={flipped}
      onFlip={onFlip}
      className="trainer-card"
      front={
        <>
          <span className="card-number">
            TREINADOR <span aria-hidden="true">◇</span>
          </span>
          <span className="trainer-portrait">
            <ImageWithFallback
              src={trainerImages[trainer.id]}
              fallback={trainerFallback}
              alt={`Retrato de ${trainer.name}`}
            />
          </span>
          <strong className="card-name">{trainer.name}</strong>
          <span className="trainer-subtitle">
            {trainer.pokemonIds.length} Pokémon na equipe
          </span>
          <span className="card-hint">↻ Clique para conhecer a equipe</span>
        </>
      }
      back={
        <>
          <strong className="card-name">{trainer.name}</strong>
          <span className="badge-count">
            ◇ {trainer.badges} {trainer.badges === 1 ? 'insígnia' : 'insígnias'}
          </span>
          <span className="team-label">EQUIPE POKÉMON</span>
          <TeamPreview trainer={trainer} pokemon={pokemon} />
          <span className="card-hint">↻ Clique para desvirar</span>
        </>
      }
    />
  );
}
