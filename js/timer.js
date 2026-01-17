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
            // Если нет выбранной парковки, использовать базовые настройки
            const selectedParking = JSON.parse(localStorage.getItem('selectedParking') || '{}');
            if (!selectedParking.id) {
                // Установить базовую парковку для быстрого старта
                const defaultParking = {
                    id: 'quick-start',
                    name: 'Быстрый старт',
                    type: 'paid',
                    cost: '20 сом/час',
                    city: 'Текущее местоположение'
                };
                localStorage.setItem('selectedParking', JSON.stringify(defaultParking));
            }
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
        
        // Показать уведомление с информацией о парковке
        const selectedParking = JSON.parse(localStorage.getItem('selectedParking') || '{}');
        const parkingName = selectedParking.name || 'Неизвестная парковка';
        const parkingCost = selectedParking.cost || '20 сом/час';
        
        this.showNotification(
            'Парковка началась', 
            `${parkingName}\nСтоимость: ${parkingCost}`
        );
        
        // Добавить визуальный эффект на кнопку
        this.addButtonFeedback('timer-btn', 'success');
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
        const timerCost = document.getElementById('timer-cost');
        const costValue = document.getElementById('cost-value');
        
        if (!timerDisplay) return;
        
        if (this.isActive && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const formatted = this.formatTime(elapsed);
            timerDisplay.textContent = formatted;
            
            if (timerStatus) {
                timerStatus.textContent = window.langManager ? 
                    window.langManager.getText('timer-active') : 'Активен';
            }
            
            // Показать и обновить стоимость
            if (timerCost && costValue) {
                timerCost.style.display = 'block';
                const cost = this.calculateCost(elapsed);
                costValue.textContent = `${cost} сом`;
            }
        } else {
            timerDisplay.textContent = '00:00:00';
            if (timerStatus) {
                timerStatus.textContent = window.langManager ? 
                    window.langManager.getText('timer-inactive') : 'Не активен';
            }
            
            // Скрыть стоимость
            if (timerCost) {
                timerCost.style.display = 'none';
            }
        }
    }
    
    updateButtons() {
        const timerBtn = document.getElementById('timer-btn');
        const timerCard = document.getElementById('timer-card');
        
        if (!timerBtn) return;
        
        if (this.isActive) {
            timerBtn.classList.add('active');
            timerBtn.textContent = window.langManager ? 
                window.langManager.getText('stop-parking') : 'Остановить парковку';
            
            // Добавить визуальный индикатор активности
            if (timerCard) {
                timerCard.classList.add('timer-active');
                timerCard.style.borderLeft = '4px solid #4CAF50';
                timerCard.style.backgroundColor = '#f8fff8';
            }
        } else {
            timerBtn.classList.remove('active');
            timerBtn.textContent = window.langManager ? 
                window.langManager.getText('start-parking') : 'Начать парковку';
            
            // Убрать визуальный индикатор активности
            if (timerCard) {
                timerCard.classList.remove('timer-active');
                timerCard.style.borderLeft = '';
                timerCard.style.backgroundColor = '';
            }
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
    
    // Расчет стоимости парковки
    calculateCost(milliseconds) {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.ceil(minutes / 60); // Округляем вверх для почасовой оплаты
        
        // Получить информацию о выбранной парковке
        const selectedParking = JSON.parse(localStorage.getItem('selectedParking') || '{}');
        
        // Обработка случаев без данных о парковке
        if (!selectedParking || !selectedParking.type) {
            return hours * 20; // Базовая стоимость по умолчанию
        }
        
        if (selectedParking.type === 'free') {
            return 0;
        }
        
        if (selectedParking.type === 'forbidden') {
            return 'Запрещено';
        }
        
        // Базовая стоимость для платных парковок
        let costPerHour = 20; // сом по умолчанию
        
        // Парсинг стоимости из данных парковки
        if (selectedParking.cost && typeof selectedParking.cost === 'string' && selectedParking.cost.includes('сом')) {
            const match = selectedParking.cost.match(/(\d+)\s*сом/);
            if (match && match[1]) {
                const parsedCost = parseInt(match[1]);
                if (!isNaN(parsedCost) && parsedCost > 0) {
                    costPerHour = parsedCost;
                }
            }
        }
        
        // Если время меньше часа, все равно считаем как час
        const billableHours = Math.max(1, hours);
        
        // Расчет итоговой стоимости с проверкой на NaN
        const totalCost = billableHours * costPerHour;
        
        return isNaN(totalCost) ? 0 : totalCost;
    }
    
    // Получить информацию о текущей парковке
    getCurrentParkingInfo() {
        const selectedParking = JSON.parse(localStorage.getItem('selectedParking') || '{}');
        return selectedParking;
    }
    
    // Установить информацию о парковке
    setParkingInfo(parkingData) {
        localStorage.setItem('selectedParking', JSON.stringify(parkingData));
    }
    
    // Визуальная обратная связь для кнопок
    addButtonFeedback(buttonId, type = 'success') {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Добавить класс анимации
        const feedbackClass = `feedback-${type}`;
        button.classList.add(feedbackClass);
        
        // Создать стили если их нет
        if (!document.getElementById('feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'feedback-styles';
            style.textContent = `
                .feedback-success {
                    animation: successPulse 0.6s ease-out;
                }
                .feedback-error {
                    animation: errorShake 0.6s ease-out;
                }
                @keyframes successPulse {
                    0% { transform: scale(1); background-color: inherit; }
                    50% { transform: scale(1.05); background-color: #4CAF50; }
                    100% { transform: scale(1); background-color: inherit; }
                }
                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Удалить класс через время анимации
        setTimeout(() => {
            button.classList.remove(feedbackClass);
        }, 600);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.parkingTimer = new ParkingTimer();
});