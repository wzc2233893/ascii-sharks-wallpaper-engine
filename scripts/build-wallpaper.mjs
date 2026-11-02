import { build } from 'vite';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(process.argv[2] || resolve(root, 'wallpaper-engine'));
await mkdir(outDir, { recursive: true });
await build({
  root,
  configFile: false,
  publicDir: false,
  build: {
    outDir,
    emptyOutDir: false,
    target: 'chrome100',
    lib: { entry: resolve(root, 'src/wallpaper.ts'), name: 'AsciiOceanWallpaper', formats: ['iife'], fileName: () => 'wallpaper.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
for (const name of ['index.html', 'project.json', 'preview.png', '使用说明.txt']) {
  await copyFile(resolve(root, 'wallpaper', name), resolve(outDir, name));
}
await copyFile(resolve(root, 'LICENSE'), resolve(outDir, 'LICENSE.txt'));
const project = JSON.parse(await readFile(resolve(outDir, 'project.json'), 'utf8'));
if (project.file !== 'index.html' || project.type !== 'web') throw new Error('Invalid wallpaper project metadata');
console.log(`Wallpaper Engine package: ${outDir}`);
