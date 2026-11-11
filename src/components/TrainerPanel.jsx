import { useEffect } from 'react';
import ImageWithFallback from './ImageWithFallback.jsx';
import TeamPreview from './TeamPreview.jsx';
import { trainersFor } from '../utils/pokemonSelectors.js';
import { trainerImages, trainerFallback } from '../data/trainerImages.js';

export default function TrainerPanel({ context, trainers, pokemon, onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(true);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const associated = trainersFor(context.id, trainers);
  return (
    <aside className="trainer-panel" aria-labelledby="panel-title">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Companheiros de jornada</span>
          <h2 id="panel-title">Treinadores de {context.name}</h2>
        </div>
        <button
          aria-label="Fechar painel de treinadores"
          onClick={(event) => onClose(event.detail === 0)}
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        {associated.length ? (
          associated.map((trainer) => (
            <section
              className="trainer-profile"
              key={trainer.id}
              aria-label={trainer.name}
            >
              <div className="profile-heading">
                <ImageWithFallback
                  src={trainerImages[trainer.id]}
                  fallback={trainerFallback}
                  alt={`Retrato de ${trainer.name}`}
                />
                <div>
                  <h3>{trainer.name}</h3>
                  <span>
                    ◇ {trainer.badges}{' '}
                    {trainer.badges === 1 ? 'insígnia' : 'insígnias'}
                  </span>
                </div>
              </div>
              <TeamPreview trainer={trainer} pokemon={pokemon} />
            </section>
          ))
        ) : (
          <p className="no-trainer">Nenhum treinador associado</p>
        )}
      </div>
    </aside>
  );
}
