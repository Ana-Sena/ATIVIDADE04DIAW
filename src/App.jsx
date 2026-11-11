import { useEffect, useRef, useState } from 'react';
import { api } from './services/api.js';
import PokemonForm from './components/PokemonForm.jsx';
import DeletePokemonDialog from './components/DeletePokemonDialog.jsx';
import Header from './components/Header.jsx';
import PokemonToolbar from './components/PokemonToolbar.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import TrainerCard from './components/TrainerCard.jsx';
import TrainerPanel from './components/TrainerPanel.jsx';
import useTheme from './hooks/useTheme.js';
import {
  flipPokemon,
  globalStatMax,
  selectPokemon,
} from './utils/pokemonSelectors.js';
import './css/tokens.css';
import './css/global.css';
import './css/cards.css';
import './css/trainers.css';

export default function App() {
  const [data, setData] = useState({ pokemon: [], types: [], trainers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [detailBusy, setDetailBusy] = useState(null);
  const detailSequence = useRef(0);
  const returnFocus = useRef(null);
  const statMax = globalStatMax(data.pokemon);
  useEffect(() => {
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(15000),
    ]);
    Promise.all([api.pokemons(signal), api.types(signal), api.trainers(signal)])
      .then(([pokemon, types, trainers]) => {
        if (!controller.signal.aborted) setData({ pokemon, types, trainers });
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure.name === 'TimeoutError'
              ? 'O servidor demorou para responder.'
              : failure.message,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);
  const [theme, toggleTheme] = useTheme();
  const [tab, setTab] = useState('pokemon');
  const [filters, setFilters] = useState({
    query: '',
    type: '',
    sort: 'id',
    direction: 'asc',
  });
  const [cards, setCards] = useState({ flipped: new Set(), panelId: null });
  const [trainerCards, setTrainerCards] = useState(new Set());
  const results = selectPokemon(data.pokemon, filters);
  const context =
    tab === 'pokemon' ? results.find((p) => p.id === cards.panelId) : null;

  function changeFilters(key, value) {
    detailSequence.current += 1;
    setDetailBusy(null);
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (
      !selectPokemon(data.pokemon, next).some((p) => p.id === cards.panelId)
    ) {
      setCards((previous) => ({ ...previous, panelId: null }));
    }
  }
  function changeTab(next) {
    detailSequence.current += 1;
    setDetailBusy(null);
    setTab(next);
    setCards((previous) => ({ ...previous, panelId: null }));
  }
  function closePanel(restoreFocus = false) {
    if (restoreFocus)
      document
        .getElementById(`pokemon-${cards.panelId}`)
        ?.focus({ preventScroll: true });
    setCards((previous) => ({ ...previous, panelId: null }));
  }
  function flipTrainer(id) {
    setTrainerCards((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  async function showDetails(pokemon) {
    if (cards.flipped.has(pokemon.id)) {
      setCards((previous) =>
        flipPokemon(previous.flipped, previous.panelId, pokemon.id),
      );
      return;
    }
    const sequence = ++detailSequence.current;
    setDetailBusy(pokemon.id);
    setError('');
    try {
      const detail = await api.pokemon(pokemon.id);
      if (sequence !== detailSequence.current) return;
      setData((previous) => ({
        ...previous,
        pokemon: previous.pokemon.map((p) => (p.id === detail.id ? detail : p)),
      }));
      setCards((previous) =>
        flipPokemon(previous.flipped, previous.panelId, detail.id),
      );
    } catch (failure) {
      if (sequence === detailSequence.current) setError(failure.message);
    } finally {
      if (sequence === detailSequence.current) setDetailBusy(null);
    }
  }
  async function editPokemon(pokemon, trigger) {
    returnFocus.current = trigger;
    setError('');
    try {
      setEditor({ pokemon: await api.pokemon(pokemon.id) });
    } catch (failure) {
      setError(failure.message);
    }
  }
  function closeDialog() {
    setEditor(null);
    setDeleting(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  async function savePokemon(payload) {
    const saved = editor.pokemon
      ? await api.update(payload)
      : await api.create(payload);
    setData((previous) => ({
      ...previous,
      pokemon: [
        ...previous.pokemon.filter((p) => p.id !== saved.id),
        saved,
      ].sort((a, b) => a.id - b.id),
    }));
    setNotice(
      saved.name +
        (editor.pokemon
          ? ' atualizado com sucesso.'
          : ' cadastrado com sucesso.'),
    );
    closeDialog();
  }
  async function deletePokemon(pokemon) {
    await api.remove(pokemon.id);
    setData((previous) => ({
      ...previous,
      pokemon: previous.pokemon.filter((p) => p.id !== pokemon.id),
      trainers: previous.trainers.map((t) => ({
        ...t,
        pokemonIds: t.pokemonIds.filter((id) => id !== pokemon.id),
      })),
    }));
    setCards((previous) => ({
      flipped: new Set([...previous.flipped].filter((id) => id !== pokemon.id)),
      panelId: previous.panelId === pokemon.id ? null : previous.panelId,
    }));
    setNotice(pokemon.name + ' excluído com sucesso.');
    setDeleting(null);
    document.getElementById('create-pokemon')?.focus();
  }
  const clear = () =>
    setFilters((previous) => ({ ...previous, query: '', type: '' }));
  return (
    <>
      <a className="skip-link" href="#main">
        Ir para o conteúdo
      </a>
      <Header
        tab={tab}
        onTab={changeTab}
        theme={theme}
        onTheme={toggleTheme}
        pokemonCount={data.pokemon.length}
        trainerCount={data.trainers.length}
      />
      <main id="main" className={context ? 'has-panel' : ''}>
        <div className="intro">
          <div>
            <span className="eyebrow">
              Explore. Descubra. Colecione histórias.
            </span>
            <h1>
              {tab === 'pokemon' ? 'Seu álbum Pokémon' : 'Os treinadores'}
            </h1>
            <p>
              {tab === 'pokemon'
                ? 'Uma carta, uma descoberta. Vire para conhecer cada detalhe.'
                : 'Conheça as pessoas e as equipes por trás de cada jornada.'}
            </p>
          </div>
          <span className="album-tag">
            ✦ Região de Kanto · {data.pokemon.length} Pokémon
          </span>
        </div>
        {notice && (
          <p role="status" className="api-notice">
            {notice}
          </p>
        )}
        {error && (
          <div role="alert" className="api-error">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={() => {
                setError('');
                setLoading(true);
                setRetry((n) => n + 1);
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {loading && <p role="status">Carregando a Pokédex…</p>}
        {!loading && !error && tab === 'pokemon' && (
          <div className="collection-actions">
            <button
              id="create-pokemon"
              className="primary-button"
              onClick={(event) => {
                returnFocus.current = event.currentTarget;
                setEditor({ pokemon: null });
              }}
            >
              + Cadastrar Pokémon
            </button>
          </div>
        )}
        {!loading &&
          (tab === 'pokemon' ? (
            <>
              <PokemonToolbar
                filters={filters}
                onChange={changeFilters}
                types={data.types}
                count={results.length}
                total={data.pokemon.length}
                onClear={clear}
              />
              <div className="grid">
                {results.map((p) => (
                  <div className="pokemon-entry" key={p.id}>
                    <PokemonCard
                      key={p.id}
                      pokemon={p}
                      flipped={cards.flipped.has(p.id)}
                      onFlip={() => showDetails(p)}
                      statMax={statMax}
                    />
                    <div className="card-actions">
                      <button
                        className="text-button"
                        aria-label={'Editar ' + p.name}
                        onClick={(event) => editPokemon(p, event.currentTarget)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-button"
                        aria-label={'Excluir ' + p.name}
                        onClick={(event) => {
                          returnFocus.current = event.currentTarget;
                          setDeleting(p);
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                    {detailBusy === p.id && (
                      <p role="status">Carregando detalhes…</p>
                    )}
                  </div>
                ))}
              </div>
              {!results.length && !error && (
                <section className="empty-state">
                  <h2>Nenhum Pokémon encontrado</h2>
                  <p>Tente outro nome, número ou tipo.</p>
                  <button className="text-button" onClick={clear}>
                    Limpar filtros
                  </button>
                </section>
              )}
            </>
          ) : (
            <div className="grid trainer-grid">
              {data.trainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  trainer={trainer}
                  pokemon={data.pokemon}
                  flipped={trainerCards.has(trainer.id)}
                  onFlip={() => flipTrainer(trainer.id)}
                />
              ))}
            </div>
          ))}
      </main>
      {context && (
        <TrainerPanel
          context={context}
          trainers={data.trainers}
          pokemon={data.pokemon}
          onClose={closePanel}
        />
      )}
      {editor && (
        <PokemonForm
          pokemon={editor.pokemon}
          types={data.types}
          onSave={savePokemon}
          onClose={closeDialog}
        />
      )}
      {deleting && (
        <DeletePokemonDialog
          pokemon={deleting}
          onDelete={deletePokemon}
          onClose={closeDialog}
        />
      )}
      <footer>Pokédex · Um álbum para explorar o mundo Pokémon.</footer>
    </>
  );
}
