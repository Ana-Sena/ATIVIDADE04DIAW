import ImageWithFallback from './ImageWithFallback.jsx';
import { artwork, resolveTeam } from '../utils/pokemonSelectors.js';
export default function TeamPreview({ trainer, pokemon }) {
  return (
    <span className="team-grid">
      {resolveTeam(trainer, pokemon).map((member, index) => (
        <span
          className="team-member"
          key={`${trainer.id}-${index}-${member.id}`}
        >
          <ImageWithFallback src={artwork(member.id)} alt="" />
          <span>{member.name}</span>
        </span>
      ))}
    </span>
  );
}
