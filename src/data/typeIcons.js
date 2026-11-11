const files = import.meta.glob('../assets/images/types/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});
// Os nomes dos arquivos correspondem aos tipos originais do JSON em minúsculas.
export const typeIcons = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop().replace('.png', ''),
    url,
  ]),
);
