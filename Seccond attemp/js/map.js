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
        // Данные парковок для основных городов Кыргызстана
        this.parkingData = [
            // Бишкек
            {
                id: 1,
                name: 'Центральная площадь',
                coords: [42.8746, 74.5698],
                type: 'paid',
                cost: '20 сом/час',
                hours: '08:00-20:00',
                rules: 'Максимум 3 часа',
                city: 'Бишкек'
            },
            {
                id: 2,
                name: 'ТЦ Вефа',
                coords: [42.8654, 74.5832],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Для посетителей ТЦ',
                city: 'Бишкек'
            },
            {
                id: 3,
                name: 'Проспект Чуй',
                coords: [42.8756, 74.5898],
                type: 'paid',
                cost: '15 сом/час',
                hours: '09:00-18:00',
                rules: 'Будние дни платно',
                city: 'Бишкек'
            },
            {
                id: 4,
                name: 'Парк Панфилова',
                coords: [42.8812, 74.5647],
                type: 'forbidden',
                cost: 'Запрещено',
                hours: 'Всегда',
                rules: 'Парковка запрещена',
                city: 'Бишкек'
            },
            {
                id: 5,
                name: 'ТЦ Дордой Плаза',
                coords: [42.8456, 74.6234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Охраняемая парковка',
                city: 'Бишкек'
            },
            
            // Ош
            {
                id: 6,
                name: 'Центр Оша',
                coords: [40.5283, 72.7985],
                type: 'paid',
                cost: '10 сом/час',
                hours: '08:00-19:00',
                rules: 'Центральная зона',
                city: 'Ош'
            },
            {
                id: 7,
                name: 'Базар Жайма',
                coords: [40.5156, 72.8123],
                type: 'paid',
                cost: '5 сом/час',
                hours: '06:00-18:00',
                rules: 'Рыночная парковка',
                city: 'Ош'
            },
            
            // Каракол
            {
                id: 8,
                name: 'Центр Каракола',
                coords: [42.4906, 78.3931],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Каракол'
            },
            
            // Нарын
            {
                id: 9,
                name: 'Центр Нарына',
                coords: [41.4286, 75.9911],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Нарын'
            },
            
            // Талас
            {
                id: 10,
                name: 'Центр Таласа',
                coords: [42.5228, 72.2394],
                type: 'free',
                cost: 'Бесплатно',
                hours: '24/7',
                rules: 'Свободная парковка',
                city: 'Талас'
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
                <div class="detail-row">
                    <span class="label">Стоимость:</span>
                    <span class="value">${parking.cost}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Время работы:</span>
                    <span class="value">${parking.hours}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Правила:</span>
                    <span class="value">${parking.rules}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Город:</span>
                    <span class="value">${parking.city}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Тип:</span>
                    <span class="value type-${parking.type}">
                        ${this.getTypeText(parking.type)}
                    </span>
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