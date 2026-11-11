export default function Header({
  tab,
  onTab,
  theme,
  onTheme,
  pokemonCount,
  trainerCount,
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main">
          <span className="pokeball" aria-hidden="true" />
          <span>
            Pokédex<small>ÁLBUM DE DESCOBERTAS</small>
          </span>
        </a>
        <nav aria-label="Coleções">
          <button
            aria-current={tab === 'pokemon' ? 'page' : undefined}
            onClick={() => onTab('pokemon')}
          >
            Pokémon <span>{pokemonCount}</span>
          </button>
          <button
            aria-current={tab === 'trainers' ? 'page' : undefined}
            onClick={() => onTab('trainers')}
          >
            Treinadores <span>{trainerCount}</span>
          </button>
        </nav>
        <button
          className="theme-toggle"
          onClick={onTheme}
          aria-label={`Ativar tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? '☾' : '☀'}{' '}
          <span>Tema {theme === 'light' ? 'escuro' : 'claro'}</span>
        </button>
      </div>
    </header>
  );
}
