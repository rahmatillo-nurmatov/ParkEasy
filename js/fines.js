// Управление страницей штрафов
class FinesManager {
    constructor() {
        this.finesData = [];
        this.init();
    }
    
    init() {
        this.loadFinesData();
        this.setupEventListeners();
    }
    
    loadFinesData() {
        // Данные о штрафах в Кыргызстане
        this.finesData = [
            {
                id: 1,
                title: {
                    ru: 'Парковка в запрещенном месте',
                    ky: 'Тыйылган жерде токтотуу'
                },
                amount: 1000,
                description: {
                    ru: 'Парковка на тротуаре, пешеходном переходе, остановке общественного транспорта',
                    ky: 'Тротуарда, жөө өтүү жолунда, коомдук транспорттун аялдамасында токтотуу'
                },
                category: 'violation'
            },
            {
                id: 2,
                title: {
                    ru: 'Превышение времени платной парковки',
                    ky: 'Акылуу токтотуунун убактысын ашыруу'
                },
                amount: 500,
                description: {
                    ru: 'Превышение оплаченного времени парковки более чем на 30 минут',
                    ky: 'Төлөнгөн токтотуу убактысын 30 мүнөттөн ашык ашыруу'
                },
                category: 'time'
            },
            {
                id: 3,
                title: {
                    ru: 'Парковка без оплаты',
                    ky: 'Төлөбөстөн токтотуу'
                },
                amount: 800,
                description: {
                    ru: 'Парковка в платной зоне без оплаты',
                    ky: 'Акылуу аймакта төлөбөстөн токтотуу'
                },
                category: 'payment'
            },
            {
                id: 4,
                title: {
                    ru: 'Блокировка проезда',
                    ky: 'Жолду бөгөттөө'
                },
                amount: 1500,
                description: {
                    ru: 'Парковка, блокирующая проезд других автомобилей',
                    ky: 'Башка унааларынын өтүүсүн бөгөттөгөн токтотуу'
                },
                category: 'blocking'
            },
            {
                id: 5,
                title: {
                    ru: 'Парковка на газоне',
                    ky: 'Көк чөптө токтотуу'
                },
                amount: 800,
                description: {
                    ru: 'Парковка на зеленых насаждениях и газонах',
                    ky: 'Жашыл отургузууларда жана көк чөптөрдө токтотуу'
                },
                category: 'environment'
            },
            {
                id: 6,
                title: {
                    ru: 'Парковка в зоне для инвалидов',
                    ky: 'Майыптар үчүн жерде токтотуу'
                },
                amount: 2000,
                description: {
                    ru: 'Парковка в местах, предназначенных для людей с ограниченными возможностями',
                    ky: 'Мүмкүнчүлүктөрү чектелген адамдар үчүн белгиленген жерлерде токтотуу'
                },
                category: 'special'
            }
        ];
        
        this.tipsData = [
            {
                id: 1,
                icon: '📍',
                title: {
                    ru: 'Проверяйте знаки',
                    ky: 'Белгилерди текшериңиз'
                },
                description: {
                    ru: 'Всегда обращайте внимание на дорожные знаки и разметку',
                    ky: 'Ар дайым жол белгилерине жана белгилөөгө көңүл буруңуз'
                }
            },
            {
                id: 2,
                icon: '⏰',
                title: {
                    ru: 'Следите за временем',
                    ky: 'Убакытты көзөмөлдөңүз'
                },
                description: {
                    ru: 'Используйте таймер приложения для контроля времени парковки',
                    ky: 'Токтотуу убактысын көзөмөлдөө үчүн колдонмонун таймерин колдонуңуз'
                }
            },
            {
                id: 3,
                icon: '💳',
                title: {
                    ru: 'Оплачивайте заранее',
                    ky: 'Алдын ала төлөңүз'
                },
                description: {
                    ru: 'В платных зонах оплачивайте парковку сразу при постановке автомобиля',
                    ky: 'Акылуу аймактарда унааны коюу менен токтотууну дароо төлөңүз'
                }
            },
            {
                id: 4,
                icon: '🚫',
                title: {
                    ru: 'Избегайте запрещенных зон',
                    ky: 'Тыйылган аймактарды качыңыз'
                },
                description: {
                    ru: 'Не паркуйтесь на тротуарах, пешеходных переходах и остановках',
                    ky: 'Тротуарларда, жөө өтүү жолдорунда жана аялдамаларда токтотпоңуз'
                }
            },
            {
                id: 5,
                icon: '📱',
                title: {
                    ru: 'Используйте приложение',
                    ky: 'Колдонмону пайдаланыңыз'
                },
                description: {
                    ru: 'Проверяйте карту парковок перед поездкой',
                    ky: 'Сапарга чыгуудан мурун токтотуу жайларынын картасын текшериңиз'
                }
            },
            {
                id: 6,
                icon: '🏛️',
                title: {
                    ru: 'Знайте законы',
                    ky: 'Мыйзамдарды билиңиз'
                },
                description: {
                    ru: 'Изучите правила дорожного движения и парковки в вашем городе',
                    ky: 'Шаарыңыздагы жол кыймылынын жана токтотуунун эрежелерин үйрөнүңүз'
                }
            }
        ];
    }
    
    setupEventListeners() {
        // Добавить интерактивность для карточек штрафов
        this.addFineCardInteractions();
        
        // Добавить поиск и фильтрацию
        this.setupSearch();
        
        // Добавить калькулятор штрафов
        this.setupCalculator();
    }
    
    addFineCardInteractions() {
        document.querySelectorAll('.fine-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
                
                // Добавить дополнительную информацию при клике
                if (!card.querySelector('.fine-details')) {
                    const details = document.createElement('div');
                    details.className = 'fine-details';
                    details.innerHTML = `
                        <div class="fine-extra-info">
                            <p><strong>Статья КоАП:</strong> Статья 124, часть 1</p>
                            <p><strong>Срок оплаты:</strong> 15 дней с момента вынесения постановления</p>
                            <p><strong>Скидка:</strong> 50% при оплате в течение 10 дней</p>
                            <button class="report-btn" onclick="this.reportViolation()">Сообщить о нарушении</button>
                        </div>
                    `;
                    card.appendChild(details);
                }
            });
        });
    }
    
    setupSearch() {
        // Создать поле поиска, если его нет
        if (!document.getElementById('fines-search')) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
                <input type="text" id="fines-search" placeholder="Поиск штрафов..." class="search-input">
                <div class="filter-buttons">
                    <button class="filter-btn active" data-category="all">Все</button>
                    <button class="filter-btn" data-category="violation">Нарушения</button>
                    <button class="filter-btn" data-category="payment">Оплата</button>
                    <button class="filter-btn" data-category="time">Время</button>
                </div>
            `;
            
            const finesSection = document.querySelector('.fines-section');
            if (finesSection) {
                finesSection.insertBefore(searchContainer, finesSection.firstChild.nextSibling);
            }
            
            // Добавить стили для поиска
            this.addSearchStyles();
            
            // Добавить обработчики
            document.getElementById('fines-search').addEventListener('input', (e) => {
                this.filterFines(e.target.value);
            });
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.filterByCategory(e.target.dataset.category);
                });
            });
        }
    }
    
    addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .search-container {
                margin: 1rem 0;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .search-input {
                width: 100%;
                padding: 0.8rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1rem;
                margin-bottom: 1rem;
            }
            
            .filter-buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .filter-btn {
                padding: 0.5rem 1rem;
                border: 1px solid #2196F3;
                background: white;
                color: #2196F3;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            
            .filter-btn.active,
            .filter-btn:hover {
                background: #2196F3;
                color: white;
            }
            
            .fine-card.hidden {
                display: none;
            }
            
            .fine-details {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #eee;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fine-extra-info p {
                margin: 0.5rem 0;
                font-size: 0.9rem;
            }
            
            .report-btn {
                background: #ff5722;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    filterFines(searchTerm) {
        const cards = document.querySelectorAll('.fine-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(term) || description.includes(term)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }
    
    filterByCategory(category) {
        const cards = document.querySelectorAll('.fine-card');
        
        cards.forEach((card, index) => {
            if (category === 'all') {
                card.classList.remove('hidden');
            } else {
                const fineData = this.finesData[index];
                if (fineData && fineData.category === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    }
    
    setupCalculator() {
        // Добавить калькулятор штрафов
        const calculatorContainer = document.createElement('div');
        calculatorContainer.className = 'calculator-section';
        calculatorContainer.innerHTML = `
            <h2>Калькулятор штрафов</h2>
            <div class="calculator-card">
                <h3>Рассчитать сумму к доплате</h3>
                <div class="calc-input-group">
                    <label>Время превышения (минуты):</label>
                    <input type="number" id="overtime-minutes" min="0" placeholder="30">
                </div>
                <div class="calc-input-group">
                    <label>Стоимость за час (сом):</label>
                    <input type="number" id="hourly-rate" min="0" placeholder="20">
                </div>
                <button id="calculate-btn" class="primary-btn">Рассчитать</button>
                <div id="calc-result" class="calc-result"></div>
            </div>
        `;
        
        const main = document.querySelector('.main');
        if (main) {
            main.appendChild(calculatorContainer);
        }
        
        // Добавить стили для калькулятора
        this.addCalculatorStyles();
        
        // Добавить обработчик
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateFine();
        });
    }
    
    addCalculatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .calculator-section {
                margin-top: 2rem;
            }
            
            .calculator-card {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .calc-input-group {
                margin-bottom: 1rem;
            }
            
            .calc-input-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #333;
            }
            
            .calc-input-group input {
                width: 100%;
                padding: 0.8rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
            }
            
            .calc-result {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 4px;
                display: none;
            }
            
            .calc-result.show {
                display: block;
            }
            
            .calc-result.warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
            }
            
            .calc-result.success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
        `;
        document.head.appendChild(style);
    }
    
    calculateFine() {
        const overtimeMinutes = parseInt(document.getElementById('overtime-minutes').value) || 0;
        const hourlyRate = parseInt(document.getElementById('hourly-rate').value) || 0;
        const resultDiv = document.getElementById('calc-result');
        
        if (overtimeMinutes <= 0 || hourlyRate <= 0) {
            resultDiv.innerHTML = 'Пожалуйста, введите корректные значения';
            resultDiv.className = 'calc-result show warning';
            return;
        }
        
        // Расчет доплаты
        const overtimeHours = overtimeMinutes / 60;
        const additionalCost = Math.ceil(overtimeHours * hourlyRate);
        
        // Расчет штрафа (если превышение больше 30 минут)
        let fine = 0;
        if (overtimeMinutes > 30) {
            fine = 500; // Базовый штраф за превышение
        }
        
        const total = additionalCost + fine;
        
        let resultHTML = `
            <h4>Результат расчета:</h4>
            <p><strong>Доплата за время:</strong> ${additionalCost} сом</p>
        `;
        
        if (fine > 0) {
            resultHTML += `<p><strong>Штраф за превышение:</strong> ${fine} сом</p>`;
        }
        
        resultHTML += `<p><strong>Итого к доплате:</strong> ${total} сом</p>`;
        
        if (fine > 0) {
            resultHTML += `<p class="warning-text">⚠️ Превышение более 30 минут влечет штраф!</p>`;
        }
        
        resultDiv.innerHTML = resultHTML;
        resultDiv.className = fine > 0 ? 'calc-result show warning' : 'calc-result show success';
    }
    
    reportViolation() {
        // Функция для сообщения о нарушении
        alert('Функция "Сообщить о нарушении" будет доступна в следующих версиях приложения');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.finesManager = new FinesManager();
});