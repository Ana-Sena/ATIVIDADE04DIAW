import { useEffect, useState } from 'react';
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pokedex-theme') === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('pokedex-theme', theme);
    } catch {
      /* O tema continua funcionando na sessão sem armazenamento. */
    }
  }, [theme]);
  return [
    theme,
    () => setTheme((previous) => (previous === 'light' ? 'dark' : 'light')),
  ];
}
