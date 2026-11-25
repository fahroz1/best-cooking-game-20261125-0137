// main.ts — menyerahkan entri Warung Rush ke /output.
// Menyalin game/ dan screenshots/ dari repo ini, lalu menulis
// dossier.json memakai buildDossier dari vendor/makefun-game.ts.
// Deterministik: tidak ada timestamp di output mana pun.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir);
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000
};

function main(): void {
  mkdirSync(outDir, { recursive: true });
  const gameSrc = join(repoRoot, 'game');
  const shotsSrc = join(repoRoot, 'screenshots');
  if (!existsSync(gameSrc)) throw new Error('main.ts: game/ tidak ditemukan di repo');
  if (!existsSync(shotsSrc)) throw new Error('main.ts: screenshots/ tidak ditemukan di repo');
  cpSync(gameSrc, join(outDir, 'game'), { recursive: true });
  cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });
  // Dossier dibangun dari salinan di direktori output, supaya isinya
  // persis sama dengan berkas yang diserahkan.
  const dossier = buildDossier(outDir, dossierCaps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
