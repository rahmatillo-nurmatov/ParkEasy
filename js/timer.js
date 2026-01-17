// Таймер парковки
class ParkingTimer {
    constructor() {
        this.startTime = null;
        this.isActive = false;
        this.intervalId = null;
        this.init();
    }
    
    init() {
        // Восстановить состояние из localStorage
        const savedStartTime = localStorage.getItem('parkingStartTime');
        const savedActive = localStorage.getItem('parkingActive');
        
        if (savedActive === 'true' && savedStartTime) {
            this.startTime = parseInt(savedStartTime);
            this.isActive = true;
            this.startTimer();
        }
        
        // Добавить обработчики событий
        const timerBtn = document.getElementById('timer-btn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => this.toggleTimer());
        }
        
        const startParkingHere = document.getElementById('start-parking-here');
        if (startParkingHere) {
            startParkingHere.addEventListener('click', () => this.startParkingAtLocation());
        }
        
        // Обновить отображение
        this.updateDisplay();
    }
    
    toggleTimer() {
        if (this.isActive) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        if (!this.startTime) {
            this.startTime = Date.now();
        }
        
        this.isActive = true;
        
        // Сохранить в localStorage
        localStorage.setItem('parkingStartTime', this.startTime.toString());
        localStorage.setItem('parkingActive', 'true');
        
        // Запустить интервал обновления
        this.intervalId = setInterval(() => {
            this.updateDisplay();
            this.checkNotifications();
        }, 1000);
        
        this.updateDisplay();
        this.updateButtons();
        
        // Показать уведомление
        this.showNotification('Парковка началась', 'Таймер запущен');
    }
    
    stopTimer() {
        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Очистить localStorage
        localStorage.removeItem('parkingStartTime');
        localStorage.removeItem('parkingActive');
        
        // Сохранить историю
        this.saveToHistory();
        
        this.startTime = null;
        this.updateDisplay();
        this.updateButtons();
        
        // Показать уведомление
        this.showNotification('Парковка завершена', 'Таймер остановлен');
    }
    
    startParkingAtLocation() {
        // Закрыть информационную панель
        const parkingInfo = document.getElementById('parking-info');
        if (parkingInfo) {
            parkingInfo.style.display = 'none';
        }
        
        // Запустить таймер
        this.startTimer();
        
        // Перейти на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    updateDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const timerStatus = document.getElementById('timer-status');
        
        if (!timerDisplay) return;
        
        if (this.isActive && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const formatted = this.formatTime(elapsed);
            timerDisplay.textContent = formatted;
            
            if (timerStatus) {
                timerStatus.textContent = window.langManager ? 
                    window.langManager.getText('timer-active') : 'Активен';
            }
        } else {
            timerDisplay.textContent = '00:00:00';
            if (timerStatus) {
                timerStatus.textContent = window.langManager ? 
                    window.langManager.getText('timer-inactive') : 'Не активен';
            }
        }
    }
    
    updateButtons() {
        const timerBtn = document.getElementById('timer-btn');
        if (!timerBtn) return;
        
        if (this.isActive) {
            timerBtn.classList.add('active');
            timerBtn.textContent = window.langManager ? 
                window.langManager.getText('stop-parking') : 'Остановить парковку';
        } else {
            timerBtn.classList.remove('active');
            timerBtn.textContent = window.langManager ? 
                window.langManager.getText('start-parking') : 'Начать парковку';
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    checkNotifications() {
        if (!this.isActive || !this.startTime) return;
        
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / (1000 * 60));
        
        // Уведомления каждые 30 минут
        if (minutes > 0 && minutes % 30 === 0) {
            const lastNotification = localStorage.getItem('lastNotificationMinute');
            if (lastNotification !== minutes.toString()) {
                this.showNotification(
                    'Напоминание о парковке',
                    `Вы паркуетесь уже ${minutes} минут`
                );
                localStorage.setItem('lastNotificationMinute', minutes.toString());
            }
        }
        
        // Предупреждение через 2 часа
        if (minutes >= 120) {
            const lastWarning = localStorage.getItem('lastWarning');
            if (lastWarning !== 'true') {
                this.showNotification(
                    'Внимание!',
                    'Вы паркуетесь более 2 часов. Проверьте правила парковки.'
                );
                localStorage.setItem('lastWarning', 'true');
            }
        }
    }
    
    showNotification(title, body) {
        // Проверить поддержку уведомлений
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: 'icons/icon-192x192.png',
                    badge: 'icons/icon-192x192.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: body,
                            icon: 'icons/icon-192x192.png',
                            badge: 'icons/icon-192x192.png'
                        });
                    }
                });
            }
        }
        
        // Показать визуальное уведомление
        this.showVisualNotification(title, body);
    }
    
    showVisualNotification(title, body) {
        // Создать элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification-popup';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${body}</p>
            </div>
        `;
        
        // Добавить стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Добавить анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Удалить через 5 секунд
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }
    
    saveToHistory() {
        if (!this.startTime) return;
        
        const duration = Date.now() - this.startTime;
        const history = JSON.parse(localStorage.getItem('parkingHistory') || '[]');
        
        history.push({
            date: new Date().toISOString(),
            duration: duration,
            formatted: this.formatTime(duration)
        });
        
        // Сохранить только последние 50 записей
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        localStorage.setItem('parkingHistory', JSON.stringify(history));
    }
    
    getHistory() {
        return JSON.parse(localStorage.getItem('parkingHistory') || '[]');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.parkingTimer = new ParkingTimer();
});