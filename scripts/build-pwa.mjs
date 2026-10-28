import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = new URL('../dist/', import.meta.url);
async function scan(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => entry.isDirectory() ? scan(join(directory, entry.name), `${prefix}${entry.name}/`) : `${prefix}${entry.name}`));
  return files.flat().filter(file => !['sw.js', 'offline-manifest.json'].includes(file));
}
const files = (await scan(fileURLToPath(root))).sort();
const hash = createHash('sha256'); let bytes = 0;
for (const file of files) { const data = await readFile(new URL(file, root)); hash.update(file).update(data); bytes += (await stat(new URL(file, root))).size; }
const version = hash.digest('hex').slice(0, 16);
const urls = files.map(file => `/${file}`);
await writeFile(new URL('offline-manifest.json', root), JSON.stringify({ version, bytes, files: urls }, null, 2));
await writeFile(new URL('sw.js', root), `/* Generated from the complete production build. No external resources. */
const CACHE = 'winteres-${version}';
const FILES = ${JSON.stringify(urls)};
let downloading;
async function announce(data) { for (const client of await self.clients.matchAll({includeUncontrolled:true})) client.postMessage(data); }
async function complete() { const cache = await caches.open(CACHE); return (await Promise.all(FILES.map(url => cache.match(url)))).every(Boolean); }
async function download() {
  if (downloading) return downloading;
  downloading = (async () => {
    const cache = await caches.open(CACHE); let done = 0;
    try {
      // A bounded queue avoids a burst of connections on mobile. Install only succeeds when ALL files exist.
      const queue = [...FILES];
      await Promise.all(Array.from({length:4}, async () => {
        while (queue.length) {
          const url = queue.shift();
          if (!await cache.match(url)) { const response = await fetch(url, {cache:'reload'}); if (!response.ok || (url !== '/index.html' && response.headers.get('content-type')?.includes('text/html'))) throw Error('Missing resource: '+url); await cache.put(url,response); }
          done++; await announce({type:'CACHE_PROGRESS',progress:Math.round(done/FILES.length*100)});
        }
      }));
      await announce({type:'CACHE_READY'});
    } catch (error) { await announce({type:'CACHE_ERROR'}); throw error; }
    finally { downloading = undefined; }
  })();
  return downloading;
}
self.addEventListener('install', event => event.waitUntil(download()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  // Normal lifecycle waits for old clients; saves are kept in localStorage and never cleared here.
  for (const key of await caches.keys()) if (key.startsWith('winteres-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message', event => {
  if (event.data?.type === 'CACHE_ALL') event.waitUntil(download().catch(() => {}));
  if (event.data?.type === 'CACHE_STATUS') event.waitUntil(complete().then(ready => event.source?.postMessage({type:ready?'CACHE_READY':'CACHE_ERROR'})));
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request.mode === 'navigate' ? '/index.html' : url.pathname);
    return cached || fetch(event.request);
  })());
});
`);
console.log(`PWA: ${files.length} local files, ${(bytes/1024/1024).toFixed(2)} MB, version ${version}`);
