// Система переключения темы
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        // Применить сохраненную тему
        this.applyTheme(this.currentTheme);
        
        // Настроить переключатель
        this.setupToggle();
        
        // Слушать системные изменения темы
        this.listenToSystemTheme();
    }
    
    setupToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Обновить иконку
            this.updateToggleIcon();
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme();
        this.updateToggleIcon();
        
        // Показать уведомление
        this.showThemeNotification();
    }
    
    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        
        this.currentTheme = theme;
    }
    
    updateToggleIcon() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
            toggleBtn.title = this.currentTheme === 'light' ? 'Включить темную тему' : 'Включить светлую тему';
        }
    }
    
    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
    }
    
    listenToSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Применить системную тему только если пользователь не выбрал вручную
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                    this.updateToggleIcon();
                }
            });
        }
    }
    
    showThemeNotification() {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="notification-content">
                ${this.currentTheme === 'dark' ? '🌙 Темная тема включена' : '☀️ Светлая тема включена'}
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.currentTheme === 'dark' ? '#333' : '#fff'};
            color: ${this.currentTheme === 'dark' ? '#fff' : '#333'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInOut 2s ease-in-out;
        `;
        
        // Добавить анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});