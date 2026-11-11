import { useEffect, useRef, useState } from 'react';
import { statLabels, typeLabels } from '../utils/pokemonSelectors.js';

export default function PokemonForm({ pokemon, types, onSave, onClose }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const typeIds = [form.get('type1'), form.get('type2')]
      .filter((id) => id !== '')
      .map(Number);
    if (new Set(typeIds).size !== typeIds.length) {
      setError('Selecione tipos diferentes.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({
        id: Number(form.get('id')),
        name: form.get('name').trim(),
        stats: Object.fromEntries(
          Object.keys(statLabels).map((key) => [key, Number(form.get(key))]),
        ),
        typeIds,
      });
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="pokemon-dialog"
      aria-labelledby="form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="dialog-heading">
          <h2 id="form-title">
            {pokemon ? 'Editar Pokémon' : 'Cadastrar Pokémon'}
          </h2>
          <button
            type="button"
            aria-label="Fechar formulário"
            disabled={busy}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <fieldset disabled={busy}>
          <div className="form-grid">
            <label>
              Número (ID)
              <input
                name="id"
                type="number"
                min="1"
                max="2147483647"
                step="1"
                required
                readOnly={!!pokemon}
                defaultValue={pokemon?.id}
                autoFocus
              />
            </label>
            <label>
              Nome
              <input
                name="name"
                required
                maxLength="80"
                pattern=".*\S.*"
                defaultValue={pokemon?.name}
              />
            </label>
            {[0, 1].map((index) => (
              <label key={index}>
                {index === 0 ? 'Tipo principal' : 'Tipo secundário'}
                <select
                  name={'type' + (index + 1)}
                  defaultValue={pokemon?.types[index]?.id ?? ''}
                >
                  <option value="">Não informado</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {typeLabels[type.name] || type.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {Object.entries(statLabels).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  type="number"
                  min="0"
                  max="999"
                  step="1"
                  required
                  defaultValue={pokemon?.stats[key] ?? 50}
                />
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="api-error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button className="primary-button" disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar Pokémon'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
