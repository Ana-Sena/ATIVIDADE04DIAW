import { useState } from 'react';
import data from './data/pokedex-data.json';
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
const statMax = globalStatMax(data.pokemon);
export default function App() {
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
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (
      !selectPokemon(data.pokemon, next).some((p) => p.id === cards.panelId)
    ) {
      setCards((previous) => ({ ...previous, panelId: null }));
    }
  }
  function changeTab(next) {
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
        {tab === 'pokemon' ? (
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
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  flipped={cards.flipped.has(p.id)}
                  onFlip={() =>
                    setCards((previous) =>
                      flipPokemon(previous.flipped, previous.panelId, p.id),
                    )
                  }
                  statMax={statMax}
                />
              ))}
            </div>
            {!results.length && (
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
        )}
      </main>
      {context && (
        <TrainerPanel
          context={context}
          trainers={data.trainers}
          pokemon={data.pokemon}
          onClose={closePanel}
        />
      )}
      <footer>Pokédex · Um álbum para explorar o mundo Pokémon.</footer>
    </>
  );
}
