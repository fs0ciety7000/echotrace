/**
 * Accessibility regression check (WCAG 2.1 AA + axe best practices) on the built app.
 * Serves dist/ with `vite preview`, drives the main screens in Chromium, runs axe-core on each,
 * in both themes. Exits 1 on any violation. Run: pnpm a11y (after pnpm build). See docs/ACCESSIBILITY.md.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import { preview } from 'vite';
import { generateSandbox } from '../../../packages/engine/src/sandbox.ts';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const SEED = 'A11Y';

interface Violation {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

async function audit(page: Page, name: string, failures: string[]) {
  await page.waitForTimeout(500);
  await page.evaluate(AXE);
  const violations: Violation[] = await page.evaluate(
    // @ts-expect-error axe is injected into the page above
    (tags) => axe.run(document, { runOnly: { type: 'tag', values: tags } }).then((r) => r.violations),
    TAGS,
  );
  for (const v of violations) {
    failures.push(
      `${name} · ${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`,
    );
  }
  console.log(`${violations.length ? '✗' : '✓'} ${name}`);
}

async function run(page: Page, url: string, theme: string, failures: string[]) {
  const term = async (cmd: string) => {
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-terminal-input]')?.focus());
    await page.keyboard.type(cmd);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(40);
  };
  const tool = (label: string) => page.click(`nav[aria-label="Outils"] button[aria-label^="${label}"]`);
  const tag = (name: string) => `${theme} · ${name}`;

  await page.goto(url);
  await page.waitForTimeout(600);
  if (theme === 'legible') await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'legible'));

  await audit(page, tag('menu'), failures);
  await page.click('button[aria-label="Paramètres"]');
  await audit(page, tag('paramètres'), failures);
  await page.keyboard.press('Escape');

  await page.click('text=Le Banc — Académie');
  await page.fill('#sandbox-seed', SEED);
  await audit(page, tag('banc'), failures);
  await page.click('text=Générer et commencer');
  await audit(page, tag('briefing'), failures);
  await page.keyboard.press('Escape');

  const { solution } = generateSandbox(SEED, 2);
  for (const cmd of solution.slice(0, 3)) await term(cmd);
  await audit(page, tag('terminal'), failures);
  await tool('Messages');
  await audit(page, tag('messages'), failures);
  await page.keyboard.press('Escape');
  for (const view of ['Vue réseau', 'Dossier', 'Journal']) {
    await tool(view);
    await audit(page, tag(view.toLowerCase()), failures);
  }
  await tool('Terminal');
  await term('learn reseau.port');
  await page.click('[role="log"] button:has-text("Port")');
  await audit(page, tag('fiche'), failures);
  await page.keyboard.press('Escape');
  for (const cmd of solution.slice(3)) await term(cmd);
  await page.waitForSelector('dialog[open] >> text=Retour au Banc', { timeout: 8000 });
  await audit(page, tag('débrief'), failures);
}

const root = resolve(import.meta.dirname, '..');
const server = await preview({ root, logLevel: 'error', preview: { port: 4179, strictPort: true, open: false } });
const browser = await chromium.launch();
const failures: string[] = [];
try {
  for (const theme of ['default', 'legible']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => failures.push(`${theme} · erreur JS — ${e.message}`));
    await run(page, 'http://localhost:4179/', theme, failures);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise<void>((done) => server.httpServer.close(() => done()));
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) d'accessibilité :\n\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('\n✓ accessibilité — aucune violation axe (WCAG 2.1 AA)');
