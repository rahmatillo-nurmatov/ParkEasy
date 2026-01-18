// Система push-уведомлений
class NotificationManager {
    constructor() {
        this.init();
    }
    
    async init() {
        // Проверить поддержку уведомлений
        if (!('Notification' in window)) {
            console.log('Браузер не поддерживает уведомления');
            return;
        }
        
        // Проверить поддержку Service Worker
        if (!('serviceWorker' in navigator)) {
            console.log('Браузер не поддерживает Service Worker');
            return;
        }
        
        // Запросить разрешение на уведомления
        await this.requestPermission();
        
        // Настроить периодические уведомления
        this.setupPeriodicNotifications();
    }
    
    async requestPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Разрешение на уведомления:', permission);
        }
    }
    
    setupPeriodicNotifications() {
        // Показать уведомление через 30 секунд после загрузки
        setTimeout(() => {
            this.showParkingTip();
        }, 30000);
        
        // Показывать уведомления каждые 10 минут
        setInterval(() => {
            this.showRandomTip();
        }, 600000); // 10 минут
    }
    
    showParkingTip() {
        if (Notification.permission === 'granted') {
            const tips = [
                {
                    title: '🅿️ Совет по парковке',
                    body: 'Всегда проверяйте дорожные знаки перед парковкой. Это поможет избежать штрафов!',
                    icon: 'icons/icon-192x192.svg'
                },
                {
                    title: '⏰ Напоминание о времени',
                    body: 'Не забывайте следить за временем парковки в платных зонах. Используйте таймер в приложении!',
                    icon: 'icons/icon-192x192.svg'
                },
                {
                    title: '💰 Экономьте на штрафах',
                    body: 'Штраф за неправильную парковку может достигать 2000 сом. Лучше найти правильное место!',
                    icon: 'icons/icon-192x192.svg'
                }
            ];
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            
            const notification = new Notification(randomTip.title, {
                body: randomTip.body,
                icon: randomTip.icon,
                badge: 'icons/icon-192x192.svg',
                tag: 'parking-tip',
                requireInteraction: false,
                silent: false
            });
            
            // Закрыть уведомление через 5 секунд
            setTimeout(() => {
                notification.close();
            }, 5000);
            
            // Обработать клик по уведомлению
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
    
    showRandomTip() {
        const tips = [
            {
                title: '📍 Проверьте карту',
                body: 'В ParkEasyKG доступно 119 парковок в 8 городах Кыргызстана. Найдите ближайшую!',
                icon: 'icons/icon-192x192.svg'
            },
            {
                title: '🚫 Избегайте запретных зон',
                body: 'Не паркуйтесь на тротуарах, пешеходных переходах и остановках общественного транспорта.',
                icon: 'icons/icon-192x192.svg'
            },
            {
                title: '💳 Оплачивайте вовремя',
                body: 'В платных зонах оплачивайте парковку сразу при постановке автомобиля.',
                icon: 'icons/icon-192x192.svg'
            },
            {
                title: '♿ Уважайте других',
                body: 'Места для людей с ограниченными возможностями предназначены только для них. Штраф - 2000 сом.',
                icon: 'icons/icon-192x192.svg'
            }
        ];
        
        if (Notification.permission === 'granted' && Math.random() < 0.3) { // 30% вероятность
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            this.showNotification(randomTip);
        }
    }
    
    showNotification(options) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon,
                badge: 'icons/icon-192x192.svg',
                tag: 'parking-info',
                requireInteraction: false,
                silent: false
            });
            
            setTimeout(() => {
                notification.close();
            }, 6000);
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
    
    // Показать уведомление о штрафе
    showFineAlert(fineAmount, reason) {
        if (Notification.permission === 'granted') {
            const notification = new Notification('⚠️ Внимание! Возможный штраф', {
                body: `${reason}. Возможный штраф: ${fineAmount} сом`,
                icon: 'icons/icon-192x192.svg',
                badge: 'icons/icon-192x192.svg',
                tag: 'fine-alert',
                requireInteraction: true,
                silent: false
            });
            
            notification.onclick = () => {
                window.open('fines.html', '_blank');
                notification.close();
            };
        }
    }
    
    // Показать уведомление об истечении времени парковки
    showParkingExpired() {
        if (Notification.permission === 'granted') {
            const notification = new Notification('⏰ Время парковки истекает!', {
                body: 'Ваше время парковки скоро закончится. Продлите или переместите автомобиль.',
                icon: 'icons/icon-192x192.svg',
                badge: 'icons/icon-192x192.svg',
                tag: 'parking-expired',
                requireInteraction: true,
                silent: false
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});