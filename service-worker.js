// Service Worker для ParkEasyKG
const CACHE_NAME = 'parkeasylg-v1.0.0';
const STATIC_CACHE = 'parkeasylg-static-v1.0.0';
const DYNAMIC_CACHE = 'parkeasylg-dynamic-v1.0.0';

// Файлы для кэширования
const STATIC_FILES = [
  './',
  './index.html',
  './map.html',
  './fines.html',
  './css/style.css',
  './js/app.js',
  './js/language.js',
  './js/timer.js',
  './js/map.js',
  './js/fines.js',
  './manifest.json',
  // Leaflet CSS и JS будут кэшироваться динамически
];

// Внешние ресурсы для кэширования
const EXTERNAL_RESOURCES = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  
  event.waitUntil(
    Promise.all([
      // Кэшировать статические файлы
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Кэширование статических файлов');
        return cache.addAll(STATIC_FILES);
      }),
      // Кэшировать внешние ресурсы
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Кэширование внешних ресурсов');
        return cache.addAll(EXTERNAL_RESOURCES);
      })
    ]).then(() => {
      console.log('Service Worker: Установка завершена');
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удалить старые кэши
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Удаление старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Активация завершена');
      return self.clients.claim();
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Обработка запросов к OpenStreetMap
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(handleTileRequest(request));
    return;
  }
  
  // Обработка запросов к внешним CDN
  if (url.hostname.includes('unpkg.com')) {
    event.respondWith(handleExternalRequest(request));
    return;
  }
  
  // Обработка локальных запросов
  if (url.origin === location.origin) {
    event.respondWith(handleLocalRequest(request));
    return;
  }
  
  // Для всех остальных запросов - стандартная обработка
  event.respondWith(
    fetch(request).catch(() => {
      // Если запрос не удался, попробовать из кэша
      return caches.match(request);
    })
  );
});

// Обработка запросов к тайлам карты
async function handleTileRequest(request) {
  try {
    // Сначала попробовать загрузить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшировать успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка загрузки тайла из сети:', error);
  }
  
  // Если сеть недоступна, попробовать из кэша
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Если нет в кэше, вернуть заглушку
  return new Response('Тайл недоступен в офлайн режиме', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Обработка внешних ресурсов
async function handleExternalRequest(request) {
  try {
    // Сначала проверить кэш
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Если нет в кэше, загрузить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшировать ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка загрузки внешнего ресурса:', error);
  }
  
  // Если ничего не получилось, вернуть ошибку
  return new Response('Ресурс недоступен', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Обработка локальных запросов
async function handleLocalRequest(request) {
  const url = new URL(request.url);
  
  // Стратегия Cache First для статических ресурсов
  if (isStaticResource(url.pathname)) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  try {
    // Попробовать загрузить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшировать динамические ресурсы
      if (!isStaticResource(url.pathname)) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка сетевого запроса:', error);
  }
  
  // Если сеть недоступна, попробовать из кэша
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Если это HTML страница и её нет в кэше, вернуть главную страницу
  if (request.headers.get('accept').includes('text/html')) {
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) {
      return indexResponse;
    }
  }
  
  // Последняя попытка - офлайн страница
  return createOfflinePage();
}

// Проверка, является ли ресурс статическим
function isStaticResource(pathname) {
  return pathname.endsWith('.css') || 
         pathname.endsWith('.js') || 
         pathname.endsWith('.png') || 
         pathname.endsWith('.jpg') || 
         pathname.endsWith('.svg') ||
         pathname === '/manifest.json';
}

// Создание офлайн страницы
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Офлайн - ParkEasyKG</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                color: #333;
            }
            .offline-container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                max-width: 400px;
                margin: 1rem;
            }
            .offline-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                color: #2196F3;
                margin-bottom: 1rem;
            }
            p {
                color: #666;
                line-height: 1.5;
                margin-bottom: 1.5rem;
            }
            .retry-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.2s;
            }
            .retry-btn:hover {
                background: #1976D2;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1>Нет соединения</h1>
            <p>Вы находитесь в офлайн режиме. Некоторые функции могут быть недоступны.</p>
            <p>Проверьте подключение к интернету и попробуйте снова.</p>
            <button class="retry-btn" onclick="window.location.reload()">Повторить</button>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Обработка фоновой синхронизации
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Фоновая синхронизация', event.tag);
  
  if (event.tag === 'parking-data-sync') {
    event.waitUntil(syncParkingData());
  }
});

// Синхронизация данных о парковке
async function syncParkingData() {
  try {
    // Получить данные из IndexedDB или localStorage
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_PARKING_DATA',
        message: 'Синхронизация данных о парковке'
      });
    });
    
    console.log('Синхронизация данных завершена');
  } catch (error) {
    console.error('Ошибка синхронизации:', error);
  }
}

// Обработка push-уведомлений (для будущих версий)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push уведомление получено');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от ParkEasyKG',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ParkEasyKG', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Клик по уведомлению');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Сообщения от основного потока
self.addEventListener('message', (event) => {
  console.log('Service Worker: Сообщение получено', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});