import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('src/data/pokedex-data.json', 'utf8'));
const imageFallback = readFileSync('public/images/pokemon-fallback.svg');
test.beforeEach(async ({ page }) => {
  // A interface deve funcionar mesmo se a hospedagem de imagens estiver indisponível.
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.goto('/');
});

test('busca por nome e ID, tipo secundário, ordenação e estado vazio', async ({
  page,
}) => {
  await expect(page.locator('.pokemon-card')).toHaveCount(151);
  const search = page.getByRole('searchbox');
  for (const query of ['25', '025', '#025']) {
    await search.fill(query);
    await expect(page.locator('.pokemon-card')).toHaveCount(1);
    await expect(page.locator('#pokemon-25')).toBeVisible();
  }
  await search.fill(' BulBA ');
  await page
    .getByRole('combobox', { name: 'Tipo', exact: true })
    .selectOption('8');
  await expect(page.locator('#pokemon-1')).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Tipo', exact: true })
    .selectOption('2');
  await expect(
    page.getByRole('heading', { name: 'Nenhum Pokémon encontrado' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).first().click();
  await page.getByRole('combobox', { name: 'Ordenar por' }).selectOption('hp');
  await page
    .getByRole('combobox', { name: 'Ordem', exact: true })
    .selectOption('desc');
  await expect(page.locator('.pokemon-card').first()).toHaveAttribute(
    'id',
    'pokemon-113',
  );
  await search.fill('inexistente');
  await page.getByRole('button', { name: 'Limpar filtros' }).first().click();
  await expect(page.getByRole('combobox', { name: 'Ordenar por' })).toHaveValue(
    'hp',
  );
  await expect(
    page.getByRole('combobox', { name: 'Ordem', exact: true }),
  ).toHaveValue('desc');
  await search.fill('151');
  await expect(page.locator('#pokemon-151 .card-front .type')).toHaveText(
    'Tipo não informado',
  );
});

test('cartas independentes e todas as transições do painel', async ({
  page,
}) => {
  const a = page.locator('#pokemon-1'),
    b = page.locator('#pokemon-2');
  await a.focus();
  await page.keyboard.press('Enter');
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#panel-title')).toHaveText(
    'Treinadores de Bulbasaur',
  );
  await expect(a.locator('.card-front')).toHaveAttribute('aria-hidden', 'true');
  await expect(a.locator('.card-back .stat')).toHaveCount(6);
  await b.focus();
  await page.keyboard.press('Space');
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#panel-title')).toHaveText(
    'Treinadores de Ivysaur',
  );
  await a.click();
  await expect(page.locator('#panel-title')).toHaveText(
    'Treinadores de Ivysaur',
  );
  await page
    .getByRole('button', { name: 'Fechar painel de treinadores' })
    .click();
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await expect(b).toHaveAttribute('aria-pressed', 'true');
  await expect(b).toHaveAttribute('aria-describedby', 'pokemon-2-details');
  await b.click();
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await b.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await expect(b).toBeFocused();
  await a.click();
  await page.getByRole('searchbox').fill('Pikachu');
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await page.getByRole('searchbox').fill('');
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await a.click();
  await a.click();
  await page.getByRole('button', { name: /Treinadores 12/ }).click();
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await page.getByRole('button', { name: /Pokémon 151/ }).click();
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await a.click();
  await a.click();
  await a.click();
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
  await page.locator('#pokemon-25').click();
  await expect(page.locator('.trainer-profile')).toHaveCount(
    data.trainers.filter((t) => t.pokemonIds.includes(25)).length,
  );
});

test('treinadores preservam equipes repetidas e não abrem painel', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Treinadores 12/ }).click();
  await expect(page.locator('.trainer-card')).toHaveCount(12);
  for (const name of ['Koga', 'Lance']) {
    const trainer = data.trainers.find((t) => t.name === name);
    const card = page
      .locator('.trainer-card')
      .nth(data.trainers.indexOf(trainer));
    await card.click();
    await expect(card.locator('.team-member')).toHaveCount(
      trainer.pokemonIds.length,
    );
    await expect(card.locator('.team-member > span')).toHaveText(
      trainer.pokemonIds.map(
        (id) => data.pokemon.find((p) => p.id === id).name,
      ),
    );
    await expect(card.locator('.badge-count')).toContainText(
      String(trainer.badges),
    );
  }
  await expect(page.locator('.trainer-card[aria-pressed=true]')).toHaveCount(2);
  await expect(page.locator('.trainer-panel')).toHaveCount(0);
});

test('tema inicia claro, persiste e funciona sem localStorage', async ({
  page,
}) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Armazenamento bloqueado');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Armazenamento bloqueado');
    };
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('fallback de imagem, mensagem sem treinador e ausência de erros React', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await expect(page.locator('#pokemon-1 .artwork-stage img')).toHaveAttribute(
    'src',
    '/images/pokemon-fallback.svg',
  );
  const unassigned = data.pokemon.find(
    (p) => !data.trainers.some((t) => t.pokemonIds.includes(p.id)),
  );
  await page.getByRole('searchbox').fill(String(unassigned.id));
  await page.locator(`#pokemon-${unassigned.id}`).click();
  await expect(page.getByText('Nenhum treinador associado')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 768, 1440]) {
  test(`layout ${width}px, dois temas, painel e movimento reduzido`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const card = page.locator('#pokemon-1');
      await card.click();
      await expect(card.locator('.card-front')).toHaveCSS(
        'visibility',
        'hidden',
      );
      const panel = await page.locator('.trainer-panel').boundingBox();
      expect(panel.x).toBeGreaterThanOrEqual(0);
      expect(panel.x + panel.width).toBeLessThanOrEqual(width);
      if (width <= 720) expect(panel.height).toBeLessThanOrEqual(361);
      await card.screenshot({
        path: `test-results/card-${width}-${theme}.png`,
      });
      await page.screenshot({
        path: `test-results/panel-${width}-${theme}.png`,
      });
      await page.keyboard.press('Escape');
      await card.click();
      await page.getByRole('button', { name: /Treinadores 12/ }).click();
      for (const trainer of data.trainers) {
        const trainerCard = page
          .locator('.trainer-card')
          .nth(data.trainers.indexOf(trainer));
        await trainerCard.click();
        const overflow = await trainerCard
          .locator('.card-back')
          .evaluate((el) => el.scrollHeight > el.clientHeight);
        expect(overflow, `${trainer.name} não pode ter conteúdo cortado`).toBe(
          false,
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/trainers-${width}-${theme}.png`,
        fullPage: true,
      });
      // Restaura as cartas para repetir as mesmas verificações no outro tema.
      for (const trainer of data.trainers)
        await page
          .getByRole('button', {
            name: `${trainer.name}: ocultar detalhes`,
            exact: true,
          })
          .click();
      await page.getByRole('button', { name: /Pokémon 151/ }).click();
      await page.screenshot({
        path: `test-results/pokemon-${width}-${theme}.png`,
      });
    }
  });
}

test('URL oficial pode exibir imagem sem alterar os dados', async ({
  page,
}) => {
  await page.unroute('https://raw.githubusercontent.com/**');
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: imageFallback,
    }),
  );
  await page.reload();
  const img = page.locator('#pokemon-1 .artwork-stage img');
  await expect(img).toHaveAttribute('src', /official-artwork\/1\.png$/);
  await expect
    .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0))
    .toBe(true);
});
