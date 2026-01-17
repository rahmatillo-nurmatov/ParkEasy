// Система отзывов без регистрации
class ReviewSystem {
    constructor() {
        this.selectedRating = 0;
        this.init();
    }
    
    init() {
        this.loadReviews();
        this.setupEventListeners();
        this.updateRatingSummary();
    }
    
    setupEventListeners() {
        // Обработчики для звезд рейтинга
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.selectedRating = parseInt(e.target.dataset.rating);
                this.updateStarsDisplay();
            });
            
            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });
        
        // Сброс подсветки при уходе мыши
        document.querySelector('.stars-input').addEventListener('mouseleave', () => {
            this.updateStarsDisplay();
        });
        
        // Отправка отзыва
        document.getElementById('submit-review').addEventListener('click', () => {
            this.submitReview();
        });
        
        // Валидация полей
        document.getElementById('reviewer-name').addEventListener('input', this.validateForm.bind(this));
        document.getElementById('review-text').addEventListener('input', this.validateForm.bind(this));
    }
    
    highlightStars(rating) {
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < rating) {
                star.style.opacity = '1';
                star.style.transform = 'scale(1.1)';
            } else {
                star.style.opacity = '0.3';
                star.style.transform = 'scale(1)';
            }
        });
    }
    
    updateStarsDisplay() {
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < this.selectedRating) {
                star.style.opacity = '1';
                star.style.transform = 'scale(1)';
                star.classList.add('selected');
            } else {
                star.style.opacity = '0.3';
                star.style.transform = 'scale(1)';
                star.classList.remove('selected');
            }
        });
    }
    
    validateForm() {
        const name = document.getElementById('reviewer-name').value.trim();
        const text = document.getElementById('review-text').value.trim();
        const submitBtn = document.getElementById('submit-review');
        
        if (name.length >= 2 && text.length >= 10 && this.selectedRating > 0) {
            submitBtn.disabled = false;
            submitBtn.classList.add('enabled');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.remove('enabled');
        }
    }
    
    submitReview() {
        const name = document.getElementById('reviewer-name').value.trim();
        const text = document.getElementById('review-text').value.trim();
        
        if (!name || !text || this.selectedRating === 0) {
            this.showMessage('Пожалуйста, заполните все поля и поставьте оценку', 'error');
            return;
        }
        
        if (name.length < 2) {
            this.showMessage('Имя должно содержать минимум 2 символа', 'error');
            return;
        }
        
        if (text.length < 10) {
            this.showMessage('Отзыв должен содержать минимум 10 символов', 'error');
            return;
        }
        
        // Создать новый отзыв
        const review = {
            id: Date.now(),
            name: this.sanitizeInput(name),
            text: this.sanitizeInput(text),
            rating: this.selectedRating,
            date: new Date().toISOString(),
            avatar: this.getRandomAvatar()
        };
        
        // Сохранить отзыв
        this.saveReview(review);
        
        // Очистить форму
        this.clearForm();
        
        // Обновить отображение
        this.loadReviews();
        this.updateRatingSummary();
        
        this.showMessage('Спасибо за ваш отзыв!', 'success');
    }
    
    sanitizeInput(input) {
        // Базовая очистка от HTML тегов
        return input.replace(/<[^>]*>/g, '').substring(0, 500);
    }
    
    getRandomAvatar() {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🚗', '👩‍🚗', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🔧', '👩‍🔧', '🧑‍🚀'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }
    
    saveReview(review) {
        let reviews = this.getReviews();
        reviews.unshift(review); // Добавить в начало
        
        // Ограничить количество отзывов (максимум 100)
        if (reviews.length > 100) {
            reviews = reviews.slice(0, 100);
        }
        
        localStorage.setItem('parkeasylg_reviews', JSON.stringify(reviews));
    }
    
    getReviews() {
        const reviews = localStorage.getItem('parkeasylg_reviews');
        return reviews ? JSON.parse(reviews) : this.getDefaultReviews();
    }
    
    getDefaultReviews() {
        // Несколько начальных отзывов для демонстрации
        return [
            {
                id: 1,
                name: 'Администратор',
                text: 'Добро пожаловать в ParkEasyKG! Оставляйте ваши отзывы о приложении.',
                rating: 5,
                date: new Date(Date.now() - 86400000).toISOString(), // вчера
                avatar: '👨‍💻'
            }
        ];
    }
    
    loadReviews() {
        const reviews = this.getReviews();
        const container = document.getElementById('reviews-container');
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        container.innerHTML = reviews.map(review => this.createReviewHTML(review)).join('');
    }
    
    createReviewHTML(review) {
        const timeAgo = this.getTimeAgo(new Date(review.date));
        const stars = '⭐'.repeat(review.rating);
        
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${review.avatar}</div>
                    <div class="review-info">
                        <h4>${review.name}</h4>
                        <div class="review-rating">${stars}</div>
                    </div>
                </div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-date">${timeAgo}</div>
            </div>
        `;
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед назад`;
        return `${Math.floor(diffDays / 30)} мес назад`;
    }
    
    updateRatingSummary() {
        const reviews = this.getReviews();
        const container = document.getElementById('rating-summary');
        
        if (reviews.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        // Подсчет статистики
        const totalReviews = reviews.length;
        const ratings = [0, 0, 0, 0, 0]; // индексы 0-4 для рейтингов 1-5
        let totalRating = 0;
        
        reviews.forEach(review => {
            ratings[review.rating - 1]++;
            totalRating += review.rating;
        });
        
        const averageRating = (totalRating / totalReviews).toFixed(1);
        const stars = '⭐'.repeat(Math.round(averageRating));
        
        container.innerHTML = `
            <div class="overall-rating">
                <div class="rating-number">${averageRating}</div>
                <div class="rating-stars">${stars}</div>
                <div class="rating-count">${totalReviews} отзыв${this.getReviewsEnding(totalReviews)}</div>
            </div>
            <div class="rating-breakdown">
                ${[5, 4, 3, 2, 1].map(rating => {
                    const count = ratings[rating - 1];
                    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return `
                        <div class="rating-bar">
                            <span>${rating} ⭐</span>
                            <div class="bar"><div class="fill" style="width: ${percentage}%"></div></div>
                            <span>${percentage}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    getReviewsEnding(count) {
        if (count % 10 === 1 && count % 100 !== 11) return '';
        if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а';
        return 'ов';
    }
    
    clearForm() {
        document.getElementById('reviewer-name').value = '';
        document.getElementById('review-text').value = '';
        this.selectedRating = 0;
        this.updateStarsDisplay();
        this.validateForm();
    }
    
    showMessage(text, type) {
        // Удалить предыдущие сообщения
        document.querySelectorAll('.review-message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `review-message ${type}`;
        message.textContent = text;
        
        const form = document.querySelector('.add-review-form');
        form.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.reviewSystem = new ReviewSystem();
});