// Карта парковок
class ParkingMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.parkingData = [];
        this.init();
    }
    
    init() {
        this.initMap();
        this.loadParkingData();
        this.setupEventListeners();
    }
    
    initMap() {
        // Проверить, загружен ли Leaflet
        if (typeof L === 'undefined') {
            console.error('Leaflet не загружен');
            document.getElementById('map').innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Карта недоступна. Проверьте подключение к интернету.</div>';
            return;
        }
        
        // Центр Бишкека
        const bishkekCenter = [42.8746, 74.5698];
        
        try {
            this.map = L.map('map').setView(bishkekCenter, 13);
            
            // Добавить слой карты
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
        } catch (error) {
            console.error('Ошибка инициализации карты:', error);
            document.getElementById('map').innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Ошибка загрузки карты</div>';
            return;
        }
        
        // Попытаться получить текущее местоположение
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = [position.coords.latitude, position.coords.longitude];
                    
                    // Добавить маркер пользователя
                    L.marker(userLocation, {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '📍',
                            iconSize: [20, 20]
                        })
                    }).addTo(this.map).bindPopup('Ваше местоположение');
                    
                    // Центрировать карту на пользователе, если он в Кыргызстане
                    if (this.isInKyrgyzstan(userLocation)) {
                        this.map.setView(userLocation, 15);
                    }
                },
                (error) => {
                    console.log('Не удалось получить местоположение:', error);
                }
            );
        }
    }
    
    isInKyrgyzstan(coords) {
        // Примерные границы Кыргызстана
        const [lat, lng] = coords;
        return lat >= 39.2 && lat <= 43.3 && lng >= 69.3 && lng <= 80.3;
    }
    
    loadParkingData() {
        // Расширенные данные парковок для всех городов Кыргызстана
        this.parkingData = [
            // БИШКЕК - детальные данные
            {
                id: 1,
                name: 'Центральная площадь Ала-Тоо',
                coords: [42.8746, 74.5698],
                type: 'paid',
                cost: '20 сом/час',
                hours: '08:00-20:00',
                rules: 'Максимум 3 часа, платно в будние дни',
                city: 'Бишкек',
                address: 'пл. Ала-Тоо',
                capacity: '50 мест'
            },
            {
                id: 2,
                name: 'ТЦ Вефа Центр',
                coords: [42.8654, 74.5832],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-22:00',
                rules: 'Для посетителей ТЦ, максимум 4 часа',
                city: 'Бишкек',
                address: 'ул. Киевская, 148',
                capacity: '200 мест'
            },
            {
                id: 3,
                name: 'Проспект Чуй (центр)',
                coords: [42.8756, 74.5898],
                type: 'paid',
                cost: '15 сом/час',
                hours: '09:00-18:00',
                rules: 'Платно в будние дни, выходные бесплатно',
                city: 'Бишкек',
                address: 'пр. Чуй, 200-250',
                capacity: '30 мест'
            },
            {
                id: 4,
                name: 'Парк им. Панфилова',
                coords: [42.8812, 74.5647],
                type: 'forbidden',
                cost: 'Запрещено',
                hours: 'Всегда',
                rules: 'Парковка запрещена - парковая зона',
                city: 'Бишкек',
                address: 'ул. Панфилова',
                capacity: '0 мест'
            },
            {
                id: 5,
                name: 'ТЦ Дордой Плаза',
                coords: [42.8456, 74.6234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Охраняемая парковка для посетителей',
                city: 'Бишкек',
                address: 'ул. Исанова, 42',
                capacity: '500 мест'
            },
            {
                id: 6,
                name: 'ТЦ Азия Молл',
                coords: [42.8234, 74.5456],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-23:00',
                rules: 'Бесплатно первые 3 часа',
                city: 'Бишкек',
                address: 'ул. Турусбекова, 109/3',
                capacity: '800 мест'
            },
            {
                id: 7,
                name: 'Ошский рынок',
                coords: [42.8567, 74.6123],
                type: 'paid',
                cost: '10 сом/час',
                hours: '06:00-18:00',
                rules: 'Платная парковка у рынка',
                city: 'Бишкек',
                address: 'ул. Ахунбаева',
                capacity: '100 мест'
            },
            {
                id: 8,
                name: 'Аэропорт Манас',
                coords: [43.0612, 74.4776],
                type: 'paid',
                cost: '50 сом/час, 300 сом/сутки',
                hours: '24/7',
                rules: 'Краткосрочная и долгосрочная парковка',
                city: 'Бишкек',
                address: 'Аэропорт Манас',
                capacity: '1000 мест'
            },
            {
                id: 9,
                name: 'ТЦ Бишкек Парк',
                coords: [42.8345, 74.5234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-22:00',
                rules: 'Бесплатная парковка для посетителей',
                city: 'Бишкек',
                address: 'ул. Ахунбаева, 119А',
                capacity: '600 мест'
            },
            {
                id: 10,
                name: 'Железнодорожный вокзал',
                coords: [42.8456, 74.5789],
                type: 'paid',
                cost: '25 сом/час',
                hours: '24/7',
                rules: 'Охраняемая парковка у вокзала',
                city: 'Бишкек',
                address: 'ул. Боконбаева, 1',
                capacity: '150 мест'
            },

            // ОШ - расширенные данные
            {
                id: 11,
                name: 'Центр Оша (Ленина)',
                coords: [40.5283, 72.7985],
                type: 'paid',
                cost: '10 сом/час',
                hours: '08:00-19:00',
                rules: 'Центральная зона, платно в будние дни',
                city: 'Ош',
                address: 'ул. Ленина',
                capacity: '40 мест'
            },
            {
                id: 12,
                name: 'Базар Жайма',
                coords: [40.5156, 72.8123],
                type: 'paid',
                cost: '5 сом/час',
                hours: '06:00-18:00',
                rules: 'Рыночная парковка, охраняемая',
                city: 'Ош',
                address: 'ул. Курманжан Датка',
                capacity: '200 мест'
            },
            {
                id: 13,
                name: 'Аэропорт Ош',
                coords: [40.6090, 72.7934],
                type: 'paid',
                cost: '30 сом/час, 200 сом/сутки',
                hours: '24/7',
                rules: 'Парковка у международного аэропорта',
                city: 'Ош',
                address: 'Аэропорт Ош',
                capacity: '300 мест'
            },
            {
                id: 14,
                name: 'Сулайман-Тоо (подножие)',
                coords: [40.5234, 72.8045],
                type: 'free',
                cost: 'Бесплатно',
                hours: '06:00-20:00',
                rules: 'Парковка для туристов у священной горы',
                city: 'Ош',
                address: 'ул. Курманжан Датка',
                capacity: '80 мест'
            },
            {
                id: 15,
                name: 'ТЦ Ош Плаза',
                coords: [40.5345, 72.7856],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-21:00',
                rules: 'Бесплатно для посетителей ТЦ',
                city: 'Ош',
                address: 'ул. Масалиева, 42',
                capacity: '150 мест'
            },

            // КАРАКОЛ - детальные данные
            {
                id: 16,
                name: 'Центр Каракола',
                coords: [42.4906, 78.3931],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка в центре',
                city: 'Каракол',
                address: 'ул. Ленина',
                capacity: '60 мест'
            },
            {
                id: 17,
                name: 'Каракольский базар',
                coords: [42.4856, 78.3945],
                type: 'free',
                cost: 'Бесплатно',
                hours: '06:00-18:00',
                rules: 'Парковка у животноводческого рынка',
                city: 'Каракол',
                address: 'ул. Токтогула',
                capacity: '100 мест'
            },
            {
                id: 18,
                name: 'Пристань Иссык-Куль',
                coords: [42.4823, 78.3867],
                type: 'paid',
                cost: '20 сом/день',
                hours: '06:00-22:00',
                rules: 'Парковка у пристани, сезонная оплата',
                city: 'Каракол',
                address: 'Набережная',
                capacity: '200 мест'
            },
            {
                id: 19,
                name: 'Мечеть Дунган',
                coords: [42.4934, 78.3912],
                type: 'free',
                cost: 'Бесплатно',
                hours: '08:00-18:00',
                rules: 'Парковка для посетителей мечети',
                city: 'Каракол',
                address: 'ул. Московская',
                capacity: '30 мест'
            },

            // НАРЫН - расширенные данные
            {
                id: 20,
                name: 'Центр Нарына',
                coords: [41.4286, 75.9911],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Нарын',
                address: 'ул. Ленина',
                capacity: '50 мест'
            },
            {
                id: 21,
                name: 'Нарынский университет',
                coords: [41.4234, 75.9856],
                type: 'free',
                cost: 'Бесплатно',
                hours: '08:00-18:00',
                rules: 'Парковка для студентов и посетителей',
                city: 'Нарын',
                address: 'ул. Сагынбай Орозбак уулу',
                capacity: '80 мест'
            },
            {
                id: 22,
                name: 'Нарынский базар',
                coords: [41.4267, 75.9934],
                type: 'free',
                cost: 'Бесплатно',
                hours: '07:00-17:00',
                rules: 'Рыночная парковка',
                city: 'Нарын',
                address: 'ул. Токтогула',
                capacity: '70 мест'
            },

            // ТАЛАС - расширенные данные
            {
                id: 23,
                name: 'Центр Таласа',
                coords: [42.5228, 72.2394],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка в центре',
                city: 'Талас',
                address: 'ул. Ленина',
                capacity: '40 мест'
            },
            {
                id: 24,
                name: 'Таласский базар',
                coords: [42.5198, 72.2367],
                type: 'free',
                cost: 'Бесплатно',
                hours: '06:00-18:00',
                rules: 'Рыночная парковка',
                city: 'Талас',
                address: 'ул. Бердике Баатыра',
                capacity: '60 мест'
            },
            {
                id: 25,
                name: 'Манас Ордо',
                coords: [42.5456, 72.2123],
                type: 'free',
                cost: 'Бесплатно',
                hours: '09:00-18:00',
                rules: 'Парковка у мемориального комплекса',
                city: 'Талас',
                address: 'с. Тала-Булак',
                capacity: '100 мест'
            },

            // ДЖАЛАЛ-АБАД
            {
                id: 26,
                name: 'Центр Джалал-Абада',
                coords: [40.9339, 72.9953],
                type: 'paid',
                cost: '8 сом/час',
                hours: '08:00-18:00',
                rules: 'Центральная зона, платно в будние дни',
                city: 'Джалал-Абад',
                address: 'ул. Ленина',
                capacity: '35 мест'
            },
            {
                id: 27,
                name: 'Джалал-Абадский базар',
                coords: [40.9298, 72.9934],
                type: 'paid',
                cost: '5 сом/час',
                hours: '06:00-17:00',
                rules: 'Рыночная парковка',
                city: 'Джалал-Абад',
                address: 'ул. Токтогула',
                capacity: '80 мест'
            },

            // БАТКЕН
            {
                id: 28,
                name: 'Центр Баткена',
                coords: [40.0623, 70.8169],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Баткен',
                address: 'ул. Ленина',
                capacity: '25 мест'
            },

            // ТОКМОК
            {
                id: 29,
                name: 'Центр Токмока',
                coords: [42.8421, 75.3015],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Токмок',
                address: 'ул. Ленина',
                capacity: '30 мест'
            },
            {
                id: 30,
                name: 'Буранинское городище',
                coords: [42.8234, 75.2456],
                type: 'free',
                cost: 'Бесплатно',
                hours: '09:00-17:00',
                rules: 'Парковка у археологического памятника',
                city: 'Токмок',
                address: 'с. Буранинское',
                capacity: '50 мест'
            }
        ];
        
        this.addMarkersToMap();
    }
    
    addMarkersToMap() {
        this.parkingData.forEach(parking => {
            const icon = this.getMarkerIcon(parking.type);
            
            const marker = L.marker(parking.coords, { icon })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(parking));
            
            // Добавить обработчик клика
            marker.on('click', () => {
                this.showParkingInfo(parking);
            });
            
            this.markers.push(marker);
        });
    }
    
    getMarkerIcon(type) {
        let color, emoji;
        
        switch (type) {
            case 'free':
                color = '#4CAF50';
                emoji = '🅿️';
                break;
            case 'paid':
                color = '#FF9800';
                emoji = '💰';
                break;
            case 'forbidden':
                color = '#f44336';
                emoji = '🚫';
                break;
            default:
                color = '#757575';
                emoji = '❓';
        }
        
        return L.divIcon({
            className: 'parking-marker',
            html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }
    
    createPopupContent(parking) {
        return `
            <div class="parking-popup">
                <h4>${parking.name}</h4>
                <p><strong>Стоимость:</strong> ${parking.cost}</p>
                <p><strong>Время:</strong> ${parking.hours}</p>
                <p><strong>Правила:</strong> ${parking.rules}</p>
                <p><strong>Город:</strong> ${parking.city}</p>
            </div>
        `;
    }
    
    showParkingInfo(parking) {
        const infoPanel = document.getElementById('parking-info');
        const infoContent = document.getElementById('info-content');
        
        if (!infoPanel || !infoContent) return;
        
        infoContent.innerHTML = `
            <div class="parking-details">
                <h4>${parking.name}</h4>
                <div class="parking-info-grid">
                    <div class="info-row">
                        <span class="label">💰 Стоимость:</span>
                        <span class="value cost-${parking.type}">${parking.cost}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🕒 Время работы:</span>
                        <span class="value">${parking.hours}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">📍 Адрес:</span>
                        <span class="value">${parking.address || 'Не указан'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🚗 Вместимость:</span>
                        <span class="value">${parking.capacity || 'Не указана'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🏙️ Город:</span>
                        <span class="value">${parking.city}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">📋 Правила:</span>
                        <span class="value rules-text">${parking.rules}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🏷️ Тип:</span>
                        <span class="value type-badge type-${parking.type}">
                            ${this.getTypeText(parking.type)}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        // Добавить стили для деталей
        const style = document.createElement('style');
        style.textContent = `
            .parking-details h4 {
                margin-bottom: 1rem;
                color: #2196F3;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                padding: 0.3rem 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .label {
                font-weight: 500;
                color: #666;
            }
            .value {
                font-weight: 600;
            }
            .type-free { color: #4CAF50; }
            .type-paid { color: #FF9800; }
            .type-forbidden { color: #f44336; }
        `;
        document.head.appendChild(style);
        
        infoPanel.style.display = 'block';
        
        // Сохранить информацию о выбранной парковке
        localStorage.setItem('selectedParking', JSON.stringify(parking));
    }
    
    getTypeText(type) {
        const texts = {
            'free': 'Бесплатная',
            'paid': 'Платная',
            'forbidden': 'Запрещена'
        };
        return texts[type] || 'Неизвестно';
    }
    
    setupEventListeners() {
        // Закрытие информационной панели
        const closeBtn = document.getElementById('close-info');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('parking-info').style.display = 'none';
            });
        }
        
        // Кнопка "Начать парковку здесь"
        const startBtn = document.getElementById('start-parking-here');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const selectedParking = JSON.parse(localStorage.getItem('selectedParking') || '{}');
                
                // Запустить таймер через глобальный объект
                if (window.parkingTimer) {
                    window.parkingTimer.startParkingAtLocation();
                } else {
                    // Если таймер не загружен, сохранить состояние и перейти на главную
                    localStorage.setItem('parkingStartTime', Date.now().toString());
                    localStorage.setItem('parkingActive', 'true');
                    window.location.href = 'index.html';
                }
            });
        }
    }
    
    // Поиск парковок поблизости
    findNearbyParking(userCoords, radius = 5000) {
        return this.parkingData.filter(parking => {
            const distance = this.calculateDistance(userCoords, parking.coords);
            return distance <= radius;
        }).sort((a, b) => {
            const distA = this.calculateDistance(userCoords, a.coords);
            const distB = this.calculateDistance(userCoords, b.coords);
            return distA - distB;
        });
    }
    
    calculateDistance(coords1, coords2) {
        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;
        
        const R = 6371e3; // Радиус Земли в метрах
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.parkingMap = new ParkingMap();
});