// Основное приложение и PWA функциональность
class ParkEasyApp {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        this.setupPWA();
        this.setupNotifications();
        this.setupOfflineHandling();
        this.setupAppUpdates();
    }
    
    setupPWA() {
        // Регистрация Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                        this.checkForUpdates(registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
        
        // Обработка события установки PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Обработка успешной установки
        window.addEventListener('appinstalled', () => {
            console.log('PWA установлено');
            this.hideInstallButton();
            this.showNotification('Приложение установлено', 'ParkEasyKG успешно установлено на ваше устройство');
        });
        
        // Кнопка установки
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
    }
    
    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        const installCard = document.getElementById('install-card');
        
        if (installBtn) {
            installBtn.style.display = 'block';
        }
        
        if (installCard) {
            installCard.style.display = 'block';
        }
    }
    
    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        const installCard = document.getElementById('install-card');
        
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        if (installCard) {
            installCard.style.opacity = '0.5';
            const desc = installCard.querySelector('p');
            if (desc) {
                desc.textContent = 'Приложение уже установлено';
            }
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) {
            this.showNotification('Установка недоступна', 'Приложение уже установлено или установка не поддерживается');
            return;
        }
        
        this.deferredPrompt.prompt();
        
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Пользователь принял установку');
        } else {
            console.log('Пользователь отклонил установку');
        }
        
        this.deferredPrompt = null;
    }
    
    setupNotifications() {
        // Запросить разрешение на уведомления
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Разрешение на уведомления получено');
                }
            });
        }
        
        // Настроить push-уведомления (для будущих версий)
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                // Здесь можно добавить подписку на push-уведомления
                console.log('Push-уведомления поддерживаются');
            });
        }
    }
    
    setupOfflineHandling() {
        // Обработка изменения статуса сети
        window.addEventListener('online', () => {
            this.showNetworkStatus('Соединение восстановлено', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.showNetworkStatus('Нет соединения с интернетом', 'warning');
        });
        
        // Проверить текущий статус сети
        if (!navigator.onLine) {
            this.showNetworkStatus('Работа в офлайн режиме', 'info');
        }
    }
    
    showNetworkStatus(message, type) {
        const statusBar = document.createElement('div');
        statusBar.className = `network-status ${type}`;
        statusBar.textContent = message;
        
        // Стили для статус-бара
        statusBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 0.5rem;
            text-align: center;
            font-size: 0.9rem;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
        `;
        
        // Цвета в зависимости от типа
        switch (type) {
            case 'success':
                statusBar.style.background = '#4CAF50';
                statusBar.style.color = 'white';
                break;
            case 'warning':
                statusBar.style.background = '#FF9800';
                statusBar.style.color = 'white';
                break;
            case 'info':
                statusBar.style.background = '#2196F3';
                statusBar.style.color = 'white';
                break;
        }
        
        document.body.appendChild(statusBar);
        
        // Удалить через 3 секунды
        setTimeout(() => {
            statusBar.remove();
        }, 3000);
    }
    
    syncOfflineData() {
        // Синхронизация данных после восстановления соединения
        const offlineData = this.getOfflineData();
        
        if (offlineData.length > 0) {
            console.log('Синхронизация офлайн данных:', offlineData);
            // Здесь можно добавить отправку данных на сервер
            this.clearOfflineData();
        }
    }
    
    getOfflineData() {
        return JSON.parse(localStorage.getItem('offlineData') || '[]');
    }
    
    clearOfflineData() {
        localStorage.removeItem('offlineData');
    }
    
    setupAppUpdates() {
        // Проверка обновлений приложения
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showUpdateNotification();
            });
        }
    }
    
    checkForUpdates(registration) {
        // Проверить обновления каждые 30 минут
        setInterval(() => {
            registration.update();
        }, 30 * 60 * 1000);
    }
    
    showUpdateNotification() {
        const updateBar = document.createElement('div');
        updateBar.className = 'update-notification';
        updateBar.innerHTML = `
            <div class="update-content">
                <span>Доступно обновление приложения</span>
                <button id="update-btn" class="update-btn">Обновить</button>
                <button id="dismiss-update" class="dismiss-btn">×</button>
            </div>
        `;
        
        // Стили для уведомления об обновлении
        updateBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideUp 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .update-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .update-btn {
                background: white;
                color: #2196F3;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .dismiss-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(updateBar);
        
        // Обработчики кнопок
        document.getElementById('update-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('dismiss-update').addEventListener('click', () => {
            updateBar.remove();
            style.remove();
        });
    }
    
    showNotification(title, body) {
        // Показать уведомление (используется в других частях приложения)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'icons/icon-192x192.png',
                badge: 'icons/icon-192x192.png'
            });
        }
    }
    
    // Утилиты для работы с данными
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Ошибка сохранения данных:', e);
        }
    }
    
    loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
            return defaultValue;
        }
    }
    
    // Аналитика использования (для будущих версий)
    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Сохранить в локальное хранилище для последующей отправки
        const events = this.loadData('analytics', []);
        events.push(event);
        
        // Сохранить только последние 100 событий
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        this.saveData('analytics', events);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.parkEasyApp = new ParkEasyApp();
    
    // Отследить запуск приложения
    window.parkEasyApp.trackEvent('app_start', {
        page: window.location.pathname,
        language: window.langManager?.currentLang || 'ru'
    });
});