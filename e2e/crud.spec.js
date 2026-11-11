import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const seed = JSON.parse(
  readFileSync('backend/src/main/resources/seed/pokedex.json', 'utf8'),
);
test('cadastra, consulta detalhes, edita, recarrega e exclui pela API', async ({
  page,
}) => {
  let pokemon = structuredClone(seed.pokemon);
  const calls = [];
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 404 }),
  );
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    const id = Number(pathname.split('/').at(-1));
    calls.push(request.method() + ' ' + pathname);
    if (pathname === '/api/types') return route.fulfill({ json: seed.types });
    if (pathname === '/api/trainers')
      return route.fulfill({ json: seed.trainers });
    if (request.method() === 'POST' || request.method() === 'PUT') {
      const input = request.postDataJSON();
      if (request.method() === 'POST' && pokemon.some((p) => p.id === input.id))
        return route.fulfill({
          status: 409,
          json: { message: 'Já existe um Pokémon com este ID.' },
        });
      const saved = {
        id: input.id,
        name: input.name,
        stats: input.stats,
        types: input.typeIds.map((id) => seed.types.find((t) => t.id === id)),
      };
      pokemon = [...pokemon.filter((p) => p.id !== saved.id), saved];
      return route.fulfill({
        status: request.method() === 'POST' ? 201 : 200,
        json: saved,
      });
    }
    if (request.method() === 'DELETE') {
      pokemon = pokemon.filter((p) => p.id !== id);
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({
      json:
        pathname === '/api/pokemons'
          ? pokemon
          : pokemon.find((p) => p.id === id),
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '+ Cadastrar Pokémon' }).click();
  await page.getByLabel('Número (ID)').fill('152');
  await page.getByLabel('Nome', { exact: true }).fill('Chikorita');
  await page.getByLabel('Tipo principal').selectOption('4');
  await page.getByRole('button', { name: 'Salvar Pokémon' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('searchbox').fill('152');
  await expect(page.locator('#pokemon-152')).toBeVisible();
  await page.locator('#pokemon-152').click();
  await expect(page.locator('#pokemon-152')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Editar Chikorita', exact: true })
    .click();
  await expect(page.getByLabel('Número (ID)')).toHaveAttribute('readonly', '');
  await page.getByLabel('Nome', { exact: true }).fill('Chikorita editada');
  await page.getByLabel('HP', { exact: true }).fill('90');
  await page.getByRole('button', { name: 'Salvar Pokémon' }).click();
  await page.reload();
  await page.getByRole('searchbox').fill('152');
  await expect(page.locator('#pokemon-152')).toContainText('Chikorita editada');
  await page
    .getByRole('button', { name: 'Excluir Chikorita editada', exact: true })
    .click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.locator('#pokemon-152')).toBeVisible();
  await page
    .getByRole('button', { name: 'Excluir Chikorita editada', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.locator('#pokemon-152')).toHaveCount(0);
  expect(calls).toContain('POST /api/pokemons');
  expect(calls).toContain('GET /api/pokemons/152');
  expect(calls).toContain('PUT /api/pokemons/152');
  expect(calls).toContain('DELETE /api/pokemons/152');
});
test('falha inicial permite tentar novamente sem depender de JSON local', async ({
  page,
}) => {
  let offline = true;
  await page.route('**/api/**', (route) => {
    if (offline)
      return route.fulfill({
        status: 503,
        json: { message: 'Servidor indisponível.' },
      });
    const endpoint = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: endpoint.endsWith('pokemons')
        ? seed.pokemon
        : endpoint.endsWith('types')
          ? seed.types
          : seed.trainers,
    });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Servidor indisponível.');
  await expect(page.locator('.pokemon-card')).toHaveCount(0);
  offline = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.locator('.pokemon-card')).toHaveCount(151);
});
test('erro de cadastro mantém formulário e dados preenchidos', async ({
  page,
}) => {
  await page.route('**/api/**', (route) => {
    if (route.request().method() === 'POST')
      return route.fulfill({
        status: 409,
        json: { message: 'Já existe um Pokémon com este ID.' },
      });
    const endpoint = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: endpoint.endsWith('pokemons')
        ? seed.pokemon
        : endpoint.endsWith('types')
          ? seed.types
          : seed.trainers,
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '+ Cadastrar Pokémon' }).click();
  await page.getByLabel('Número (ID)').fill('25');
  await page.getByLabel('Nome', { exact: true }).fill('Pikachu');
  await page.getByRole('button', { name: 'Salvar Pokémon' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Já existe',
  );
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Pikachu');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '+ Cadastrar Pokémon' }),
  ).toBeFocused();
});
