import { useEffect, useRef, useState } from 'react';
type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };
export default function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('Comprobando descarga…');
  const [ready, setReady] = useState(false);
  const [update, setUpdate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  useEffect(() => {
    let mounted = true;
    const connectivity = () => setOnline(navigator.onLine);
    const offerInstall = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvent); };
    const message = (e: MessageEvent) => {
      if (e.data?.type === 'CACHE_PROGRESS') { setProgress(e.data.progress); setStatus(`Descargando mundo · ${e.data.progress}%`); }
      if (e.data?.type === 'CACHE_READY') { setReady(true); setProgress(100); setStatus('Mundo completo disponible sin conexión'); }
      if (e.data?.type === 'CACHE_ERROR') setStatus('La descarga se interrumpió. Puedes reintentar.');
    };
    window.addEventListener('online', connectivity); window.addEventListener('offline', connectivity);
    window.addEventListener('beforeinstallprompt', offerInstall);
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.addEventListener('message', message);
      navigator.serviceWorker.register('/sw.js').then(async reg => {
        if (!mounted) return;
        registration.current = reg;
        setUpdate(Boolean(reg.waiting));
        reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', () => { if (reg.waiting && navigator.serviceWorker.controller) setUpdate(true); }));
        const active = await navigator.serviceWorker.ready;
        if (mounted) active.active?.postMessage({ type: 'CACHE_STATUS' });
      }).catch(() => { if (mounted) setStatus('No se pudo preparar el modo offline. Reintenta con conexión.'); });
    } else setStatus(import.meta.env.DEV ? 'El modo offline se activa en la versión publicada' : 'Este navegador no permite la descarga offline');
    return () => { mounted = false; window.removeEventListener('online', connectivity); window.removeEventListener('offline', connectivity); window.removeEventListener('beforeinstallprompt', offerInstall); navigator.serviceWorker?.removeEventListener('message', message); };
  }, []);
  async function download() {
    setStatus('Preparando descarga completa…');
    try {
      await navigator.storage?.persist?.();
      const reg = registration.current || await navigator.serviceWorker.register('/sw.js');
      if (reg.active) reg.active.postMessage({ type: 'CACHE_ALL' });
      else { await navigator.serviceWorker.ready; window.location.reload(); }
    } catch { setStatus('No se pudo descargar. Revisa conexión y espacio libre.'); }
  }
  return <div className="offline-status" role="status">
    <div className="signal-label"><i className={online ? 'live-dot' : 'live-dot offline-dot'} />{online ? 'SEÑAL ACTIVA' : 'SIN CONEXIÓN'}<span>{ready ? 'OFFLINE READY' : `${progress}%`}</span></div>
    <p>{status}</p>
    {!ready && <button className="ghost" disabled={import.meta.env.DEV || !online} onClick={download}>Descargar todo</button>}
    {install && <button className="primary" onClick={async () => { await install.prompt(); const choice = await install.userChoice; if (choice.outcome === 'accepted') setInstall(null); }}>Instalar Winteres</button>}
    {ready && !install && <small>Instálalo desde el menú del navegador. Las voces dependen de las instaladas en tu dispositivo.</small>}
    {update && <button className="ghost" onClick={() => { registration.current?.waiting?.postMessage({ type: 'ACTIVATE_UPDATE' }); navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true }); }}>Aplicar actualización guardada</button>}
  </div>;
}
