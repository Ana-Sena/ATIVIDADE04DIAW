import { useEffect, useRef, useState } from 'react';
export default function DeletePokemonDialog({ pokemon, onDelete, onClose }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function remove() {
    setBusy(true);
    setError('');
    try {
      await onDelete(pokemon);
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="pokemon-dialog"
      aria-labelledby="delete-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id="delete-title">Excluir {pokemon.name}?</h2>
      <p>
        O Pokémon será removido do álbum e das equipes dos treinadores. Essa
        ação não pode ser desfeita.
      </p>
      {error && (
        <p role="alert" className="api-error">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button
          className="secondary-button"
          autoFocus
          disabled={busy}
          onClick={onClose}
        >
          Cancelar
        </button>
        <button className="danger-button" disabled={busy} onClick={remove}>
          {busy ? 'Excluindo…' : 'Confirmar exclusão'}
        </button>
      </div>
    </dialog>
  );
}
