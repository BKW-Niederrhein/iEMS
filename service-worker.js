// Name des Cache-Speichers und Version
const CACHE_NAME = 'iems-pwa-cache-v1';

// Liste aller Dateien, die gecached werden sollen (App-Shell)
const urlsToCache = [
    '/',
    '/iems.html',
    '/manifest.json',
    'BKW-NR_Logo_Schrift.png', // Logo hinzugefügt
    
    // Platzhalter für Icons (müssen Sie auf Ihrem Server erstellen und im Ordner /icons ablegen)
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

// Event: Installation des Service Workers
self.addEventListener('install', event => {
    console.log('[Service Worker] Installiere und cache App-Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Füge alle benötigten Dateien zum Cache hinzu
                return cache.addAll(urlsToCache);
            })
    );
});

// Event: Aktivierung des Service Workers (alte Caches aufräumen)
self.addEventListener('activate', event => {
    console.log('[Service Worker] Aktiviere Service Worker und räume alte Caches auf.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Lösche alten Cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event: Fetch (abfangen von Netzwerk-Anfragen)
self.addEventListener('fetch', event => {
    // Wir versuchen, die Ressource zuerst aus dem Cache zu laden.
    // Falls nicht vorhanden, gehen wir ins Netzwerk.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache Hit - gib die gecachte Version zurück
                if (response) {
                    return response;
                }
                // Kein Cache Hit - gehe ins Netzwerk
                return fetch(event.request).catch(error => {
                    // Falls das Netzwerk fehlschlägt und die Ressource nicht im Cache ist, 
                    // kann eine Offline-Meldung zurückgegeben werden. Hier ignorieren wir es, 
                    // da die App selbst gecached ist und Daten (CSV) lokal hochgeladen werden.
                    console.log('[Service Worker] Netzwerkfehler beim Abrufen:', event.request.url);
                });
            })
    );
});