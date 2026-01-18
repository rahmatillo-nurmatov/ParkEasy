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
                navigator.serviceWorker.register('./service-worker.js')
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
            console.log('beforeinstallprompt event fired');
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
        
        // Кнопка тестирования уведомлений
        const testNotificationBtn = document.getElementById('test-notification');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => {
                this.testNotification();
            });
        }
        
        // Проверить, уже ли установлено PWA
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA уже установлено');
            this.hideInstallButton();
        } else {
            // Показать кнопку установки для всех платформ
            setTimeout(() => {
                this.showInstallButtonForAllPlatforms();
            }, 2000);
        }
        
        // Для iOS Safari - показать инструкции
        if (this.isIOS() && !this.isInStandaloneMode()) {
            setTimeout(() => {
                this.showIOSInstallInstructions();
            }, 3000);
        }
    }
    
    showInstallButtonForAllPlatforms() {
        const installBtn = document.getElementById('install-btn');
        const installCard = document.getElementById('install-card');
        
        if (installBtn && !this.deferredPrompt) {
            installBtn.style.display = 'block';
            installBtn.textContent = this.getInstallButtonText();
            installBtn.onclick = () => {
                if (this.deferredPrompt) {
                    this.installApp();
                } else {
                    this.showManualInstallInstructions();
                }
            };
        }
        
        if (installCard) {
            installCard.style.display = 'block';
            installCard.style.opacity = '1';
        }
    }
    
    getInstallButtonText() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
            return 'Установить приложение';
        } else if (userAgent.includes('firefox')) {
            return 'Добавить на главный экран';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            return 'Добавить на экран';
        } else if (userAgent.includes('edg')) {
            return 'Установить приложение';
        } else {
            return 'Установить';
        }
    }
    
    showInstallButtonFallback() {
        const installBtn = document.getElementById('install-btn');
        const installCard = document.getElementById('install-card');
        
        if (installBtn && installBtn.style.display === 'none') {
            installBtn.style.display = 'block';
            installBtn.textContent = 'Установить через браузер';
            installBtn.onclick = () => {
                this.showManualInstallInstructions();
            };
        }
        
        if (installCard) {
            installCard.style.display = 'block';
            const desc = installCard.querySelector('p');
            if (desc) {
                desc.textContent = 'Установите через меню браузера';
            }
        }
    }
    
    showManualInstallInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'manual-install-instructions';
        instructions.innerHTML = `
            <div class="manual-install-content">
                <h3>📱 Установка ParkEasyKG</h3>
                <p>Выберите ваш браузер для установки приложения:</p>
                <div class="browser-instructions">
                    <div class="browser-item">
                        <strong>🖥️ Windows - Chrome/Edge:</strong>
                        <ol>
                            <li>Нажмите на иконку "Установить" в адресной строке</li>
                            <li>Или нажмите меню (⋮) → "Установить ParkEasyKG"</li>
                            <li>Нажмите "Установить" в диалоге</li>
                            <li>Приложение появится в меню "Пуск"</li>
                        </ol>
                    </div>
                    <div class="browser-item">
                        <strong>🦊 Firefox:</strong>
                        <ol>
                            <li>Нажмите на иконку "+" в адресной строке</li>
                            <li>Выберите "Установить"</li>
                            <li>Приложение добавится на рабочий стол</li>
                        </ol>
                    </div>
                    <div class="browser-item">
                        <strong>📱 Android:</strong>
                        <ol>
                            <li>Нажмите меню браузера (⋮)</li>
                            <li>Выберите "Добавить на главный экран"</li>
                            <li>Нажмите "Добавить"</li>
                        </ol>
                    </div>
                    <div class="browser-item">
                        <strong>🍎 iPhone/iPad:</strong>
                        <ol>
                            <li>Нажмите кнопку "Поделиться" ⬆️</li>
                            <li>Выберите "На экран Домой"</li>
                            <li>Нажмите "Добавить"</li>
                        </ol>
                    </div>
                </div>
                <div class="install-benefits">
                    <h4>Преимущества установки:</h4>
                    <ul>
                        <li>✅ Быстрый доступ с рабочего стола</li>
                        <li>✅ Работает без интернета</li>
                        <li>✅ Push-уведомления о парковке</li>
                        <li>✅ Полноэкранный режим</li>
                    </ul>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="close-instructions">Понятно</button>
            </div>
        `;
        
        instructions.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const content = instructions.querySelector('.manual-install-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const closeBtn = instructions.querySelector('.close-instructions');
        closeBtn.style.cssText = `
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
            width: 100%;
            font-size: 1rem;
        `;
        
        document.body.appendChild(instructions);
    }
    
    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        const installCard = document.getElementById('install-card');
        
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.style.opacity = '1';
        }
        
        if (installCard) {
            installCard.style.display = 'block';
            installCard.style.opacity = '1';
        }
        
        console.log('Кнопка установки показана');
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
                desc.textContent = window.langManager?.currentLang === 'ky' ? 
                    'Колдонмо орнотулган' : 'Приложение уже установлено';
            }
        }
        
        console.log('Кнопка установки скрыта');
    }
    
    async installApp() {
        console.log('Попытка установки PWA...');
        
        if (!this.deferredPrompt) {
            console.log('Нет отложенного события установки');
            // Если нет события установки, показать инструкции
            if (this.isIOS()) {
                this.showIOSInstallInstructions();
            } else {
                // Проверить, может ли браузер установить PWA
                if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
                    this.showNotification('Установка недоступна', 'Попробуйте позже или используйте меню браузера');
                } else {
                    this.showNotification('PWA не поддерживается', 'Ваш браузер не поддерживает установку веб-приложений');
                }
            }
            return;
        }
        
        try {
            console.log('Показ диалога установки...');
            this.deferredPrompt.prompt();
            
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('Результат установки:', outcome);
            
            if (outcome === 'accepted') {
                console.log('Пользователь принял установку');
                this.showNotification('Установка началась', 'Приложение устанавливается...');
                this.hideInstallButton();
            } else {
                console.log('Пользователь отклонил установку');
                this.showNotification('Установка отменена', 'Вы можете установить приложение позже через меню браузера');
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('Ошибка установки:', error);
            this.showNotification('Ошибка установки', 'Попробуйте установить через меню браузера: Меню → Установить приложение');
        }
    }
    
    testNotification() {
        console.log('Тестирование уведомлений...');
        
        if (!('Notification' in window)) {
            this.showNotification('Ошибка', 'Ваш браузер не поддерживает уведомления');
            return;
        }
        
        if (Notification.permission === 'granted') {
            // Показать тестовое уведомление
            if (window.notificationManager) {
                window.notificationManager.showParkingTip();
                this.showNotification('Тест успешен', 'Уведомление отправлено! Проверьте системные уведомления.');
            } else {
                // Fallback - создать уведомление напрямую
                const notification = new Notification('🅿️ Тест уведомлений ParkEasyKG', {
                    body: 'Уведомления работают корректно! Теперь вы будете получать полезные советы по парковке.',
                    icon: 'icons/icon-192x192.svg',
                    badge: 'icons/icon-192x192.svg',
                    tag: 'test-notification'
                });
                
                setTimeout(() => {
                    notification.close();
                }, 5000);
                
                this.showNotification('Тест успешен', 'Уведомление отправлено!');
            }
        } else if (Notification.permission === 'default') {
            // Запросить разрешение
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.testNotification(); // Повторить тест после получения разрешения
                } else {
                    this.showNotification('Разрешение отклонено', 'Для получения уведомлений разрешите их в настройках браузера');
                }
            });
        } else {
            this.showNotification('Разрешение отклонено', 'Уведомления заблокированы. Разрешите их в настройках браузера');
        }
    }
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    isInStandaloneMode() {
        return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    }
    
    showIOSInstallInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'ios-install-instructions';
        instructions.innerHTML = `
            <div class="ios-install-content">
                <h3>📱 Установка на iOS</h3>
                <p>Для установки приложения на iPhone/iPad:</p>
                <ol>
                    <li>Нажмите кнопку "Поделиться" <span style="font-size: 1.2em;">⬆️</span></li>
                    <li>Выберите "На экран Домой" <span style="font-size: 1.2em;">➕</span></li>
                    <li>Нажмите "Добавить"</li>
                </ol>
                <button onclick="this.parentElement.parentElement.remove()" class="close-instructions">Понятно</button>
            </div>
        `;
        
        instructions.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const content = instructions.querySelector('.ios-install-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 400px;
            text-align: center;
        `;
        
        const closeBtn = instructions.querySelector('.close-instructions');
        closeBtn.style.cssText = `
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
        `;
        
        document.body.appendChild(instructions);
    }
    
    setupNotifications() {
        // Запросить разрешение на уведомления при первом запуске
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // Показать объяснение перед запросом разрешения
                setTimeout(() => {
                    this.showNotificationPermissionRequest();
                }, 2000);
            } else if (Notification.permission === 'granted') {
                console.log('Разрешение на уведомления уже получено');
            }
        }
        
        // Настроить push-уведомления (для будущих версий)
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                // Здесь можно добавить подписку на push-уведомления
                console.log('Push-уведомления поддерживаются');
            });
        }
    }
    
    showNotificationPermissionRequest() {
        const permissionDialog = document.createElement('div');
        permissionDialog.className = 'permission-dialog';
        permissionDialog.innerHTML = `
            <div class="permission-content">
                <div class="permission-icon">🔔</div>
                <h3>Разрешить уведомления?</h3>
                <p>ParkEasyKG будет отправлять полезные напоминания:</p>
                <ul>
                    <li>⏰ Напоминания о времени парковки</li>
                    <li>⚠️ Предупреждения о превышении времени</li>
                    <li>💰 Уведомления о стоимости</li>
                </ul>
                <div class="permission-buttons">
                    <button id="allow-notifications" class="allow-btn">Разрешить</button>
                    <button id="deny-notifications" class="deny-btn">Не сейчас</button>
                </div>
            </div>
        `;
        
        permissionDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const content = permissionDialog.querySelector('.permission-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(permissionDialog);
        
        // Обработчики кнопок
        document.getElementById('allow-notifications').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Уведомления включены', 'Теперь вы будете получать полезные напоминания');
                }
                permissionDialog.remove();
            });
        });
        
        document.getElementById('deny-notifications').addEventListener('click', () => {
            permissionDialog.remove();
        });
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