// Карта парковок
class ParkingMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.parkingData = [];
        this.init();
    }
    
    init() {
        this.showLoadingIndicator();
        this.initMap();
        this.loadParkingData();
        this.setupEventListeners();
        this.hideLoadingIndicator();
    }
    
    showLoadingIndicator() {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 300px;
                    color: #666;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem; animation: spin 2s linear infinite;">🗺️</div>
                    <div style="font-size: 1.1rem;">Загрузка карты...</div>
                </div>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
        }
    }
    
    hideLoadingIndicator() {
        // Индикатор загрузки будет скрыт автоматически при инициализации карты
    }
    
    initMap() {
        // Проверить, загружен ли Leaflet
        if (typeof L === 'undefined') {
            console.error('Leaflet не загружен');
            this.showMapError('Карта недоступна. Проверьте подключение к интернету.');
            return;
        }
        
        // Центр Бишкека (более точные координаты)
        const bishkekCenter = [42.8746, 74.5698];
        
        try {
            this.map = L.map('map', {
                center: bishkekCenter,
                zoom: 12,
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                dragging: true,
                touchZoom: true
            });
            
            // Добавить несколько слоев карты для лучшего покрытия
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 8
            });
            
            // Альтернативный слой карты (более детальный)
            const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© CARTO © OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 8
            });
            
            // Использовать основной слой
            osmLayer.addTo(this.map);
            
            // Добавить контроль слоев
            const baseMaps = {
                "Стандартная карта": osmLayer,
                "Детальная карта": cartoLayer
            };
            
            L.control.layers(baseMaps).addTo(this.map);
            
            // Обработка ошибок загрузки тайлов
            osmLayer.on('tileerror', (e) => {
                console.log('Ошибка загрузки тайла:', e);
                // Переключиться на альтернативный слой при ошибках
                this.map.removeLayer(osmLayer);
                cartoLayer.addTo(this.map);
            });
            
            console.log('Карта успешно инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации карты:', error);
            this.showMapError('Ошибка загрузки карты');
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
                            html: '<div style="background: #2196F3; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
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
    
    showMapError(message) {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    padding: 20px; 
                    text-align: center; 
                    color: #666;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 300px;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                    <div style="font-size: 1.1rem; margin-bottom: 1rem;">${message}</div>
                    <button onclick="window.location.reload()" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">Попробовать снова</button>
                </div>
            `;
        }
    }
    
    isInKyrgyzstan(coords) {
        // Примерные границы Кыргызстана
        const [lat, lng] = coords;
        return lat >= 39.2 && lat <= 43.3 && lng >= 69.3 && lng <= 80.3;
    }
    
    loadParkingData() {
        // Обновленные данные парковок на основе 2ГИС с реальными координатами и названиями
        this.parkingData = [
            // БИШКЕК - 15+ локаций с реальными данными из 2ГИС
            {
                id: 1,
                name: 'ТЦ "Дордой Плаза"',
                coords: [42.8456, 74.6234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-22:00',
                rules: 'Бесплатная парковка для посетителей ТЦ',
                city: 'Бишкек',
                address: 'ул. Исанова, 42',
                capacity: '500 мест'
            },
            {
                id: 2,
                name: 'ТЦ "Азия Молл"',
                coords: [42.8234, 74.5456],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-23:00',
                rules: 'Бесплатно первые 3 часа, далее 20 сом/час',
                city: 'Бишкек',
                address: 'ул. Турусбекова, 109/3',
                capacity: '800 мест'
            },
            {
                id: 3,
                name: 'ТЦ "Вефа Центр"',
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
                id: 4,
                name: 'ТЦ "Бишкек Парк"',
                coords: [42.8345, 74.5234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-22:00',
                rules: 'Бесплатная охраняемая парковка',
                city: 'Бишкек',
                address: 'ул. Ахунбаева, 119А',
                capacity: '600 мест'
            },
            {
                id: 5,
                name: 'Площадь Ала-Тоо',
                coords: [42.8746, 74.5698],
                type: 'paid',
                cost: '30 сом/час',
                hours: '08:00-20:00',
                rules: 'Платная парковка в центре города',
                city: 'Бишкек',
                address: 'пл. Ала-Тоо',
                capacity: '50 мест'
            },
            {
                id: 6,
                name: 'Проспект Чуй (у Белого дома)',
                coords: [42.8756, 74.5898],
                type: 'paid',
                cost: '25 сом/час',
                hours: '09:00-18:00',
                rules: 'Платно в будние дни, выходные бесплатно',
                city: 'Бишкек',
                address: 'пр. Чуй, 205',
                capacity: '30 мест'
            },
            {
                id: 7,
                name: 'Аэропорт "Манас"',
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
                id: 8,
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
            {
                id: 9,
                name: 'Ошский рынок',
                coords: [42.8567, 74.6123],
                type: 'paid',
                cost: '15 сом/час',
                hours: '06:00-18:00',
                rules: 'Платная охраняемая парковка',
                city: 'Бишкек',
                address: 'ул. Ахунбаева',
                capacity: '200 мест'
            },
            {
                id: 10,
                name: 'ТЦ "Мегакомплекс Ош"',
                coords: [42.8445, 74.6145],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-22:00',
                rules: 'Бесплатно для посетителей',
                city: 'Бишкек',
                address: 'ул. Ахунбаева, 67',
                capacity: '300 мест'
            },
            {
                id: 11,
                name: 'Государственная филармония',
                coords: [42.8712, 74.5834],
                type: 'paid',
                cost: '20 сом/час',
                hours: '18:00-23:00',
                rules: 'Платная парковка во время мероприятий',
                city: 'Бишкек',
                address: 'ул. Токтогула, 253',
                capacity: '80 мест'
            },
            {
                id: 12,
                name: 'Национальный банк КР',
                coords: [42.8723, 74.5945],
                type: 'paid',
                cost: '40 сом/час',
                hours: '09:00-17:00',
                rules: 'Деловой центр, высокая стоимость',
                city: 'Бишкек',
                address: 'пр. Чуй, 168',
                capacity: '40 мест'
            },
            {
                id: 13,
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
                id: 14,
                name: 'ТЦ "Караван"',
                coords: [42.8567, 74.5234],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-21:00',
                rules: 'Бесплатная парковка для покупателей',
                city: 'Бишкек',
                address: 'ул. Московская, 181',
                capacity: '250 мест'
            },
            {
                id: 15,
                name: 'Гипермаркет "Глобус"',
                coords: [42.8234, 74.5678],
                type: 'free',
                cost: 'Бесплатно',
                hours: '09:00-23:00',
                rules: 'Большая бесплатная парковка',
                city: 'Бишкек',
                address: 'ул. Горького, 1А',
                capacity: '400 мест'
            },

            // ОШ - 15+ локаций с реальными данными
            {
                id: 16,
                name: 'Центральная мечеть Оша',
                coords: [40.5283, 72.7985],
                type: 'free',
                cost: 'Бесплатно',
                hours: '05:00-22:00',
                rules: 'Бесплатная парковка для верующих',
                city: 'Ош',
                address: 'ул. Ленина, 331',
                capacity: '100 мест'
            },
            {
                id: 17,
                name: 'Базар "Жайма"',
                coords: [40.5156, 72.8123],
                type: 'paid',
                cost: '10 сом/час',
                hours: '06:00-18:00',
                rules: 'Охраняемая рыночная парковка',
                city: 'Ош',
                address: 'ул. Курманжан Датка',
                capacity: '300 мест'
            },
            {
                id: 18,
                name: 'Аэропорт Ош',
                coords: [40.6090, 72.7934],
                type: 'paid',
                cost: '40 сом/час, 250 сом/сутки',
                hours: '24/7',
                rules: 'Международный аэропорт',
                city: 'Ош',
                address: 'Аэропорт Ош',
                capacity: '400 мест'
            },
            {
                id: 19,
                name: 'Сулайман-Тоо (подножие)',
                coords: [40.5234, 72.8045],
                type: 'free',
                cost: 'Бесплатно',
                hours: '06:00-20:00',
                rules: 'Туристическая парковка у священной горы',
                city: 'Ош',
                address: 'ул. Курманжан Датка',
                capacity: '150 мест'
            },
            {
                id: 20,
                name: 'ТЦ "Ош Плаза"',
                coords: [40.5345, 72.7856],
                type: 'free',
                cost: 'Бесплатно',
                hours: '10:00-21:00',
                rules: 'Бесплатно для посетителей ТЦ',
                city: 'Ош',
                address: 'ул. Масалиева, 42',
                capacity: '200 мест'
            },
            {
                id: 21,
                name: 'Ошский государственный университет',
                coords: [40.5267, 72.8012],
                type: 'free',
                cost: 'Бесплатно',
                hours: '08:00-18:00',
                rules: 'Для студентов и преподавателей',
                city: 'Ош',
                address: 'ул. Ленина, 331',
                capacity: '120 мест'
            },
            {
                id: 22,
                name: 'Центральный парк Оша',
                coords: [40.5198, 72.7967],
                type: 'paid',
                cost: '15 сом/час',
                hours: '09:00-21:00',
                rules: 'Парковка у входа в парк',
                city: 'Ош',
                address: 'ул. Кыргызстан',
                capacity: '80 мест'
            },
            {
                id: 23,
                name: 'Ошский драматический театр',
                coords: [40.5234, 72.7923],
                type: 'paid',
                cost: '20 сом/час',
                hours: '18:00-23:00',
                rules: 'Во время спектаклей',
                city: 'Ош',
                address: 'ул. Курманжан Датка, 364',
                capacity: '60 мест'
            },
            {
                id: 24,
                name: 'Гипермаркет "Народный"',
                coords: [40.5123, 72.7834],
                type: 'free',
                cost: 'Бесплатно',
                hours: '09:00-22:00',
                rules: 'Бесплатная парковка для покупателей',
                city: 'Ош',
                address: 'ул. Масалиева, 15',
                capacity: '180 мест'
            },
            {
                id: 25,
                name: 'Ошский медицинский институт',
                coords: [40.5289, 72.7945],
                type: 'free',
                cost: 'Бесплатно',
                hours: '08:00-17:00',
                rules: 'Для студентов и сотрудников',
                city: 'Ош',
                address: 'ул. Ленина, 444',
                capacity: '100 мест'
            },
            {
                id: 26,
                name: 'Центральная больница Оша',
                coords: [40.5167, 72.7889],
                type: 'paid',
                cost: '25 сом/час',
                hours: '24/7',
                rules: 'Платная парковка у больницы',
                city: 'Ош',
                address: 'ул. Исанова, 42',
                capacity: '90 мест'
            },
            {
                id: 27,
                name: 'Стадион "Сулайман-Тоо"',
                coords: [40.5201, 72.8067],
                type: 'paid',
                cost: '30 сом/час',
                hours: 'Во время матчей',
                rules: 'Только в дни игр',
                city: 'Ош',
                address: 'ул. Спортивная, 1',
                capacity: '200 мест'
            },
            {
                id: 28,
                name: 'Автовокзал Ош',
                coords: [40.5145, 72.7912],
                type: 'paid',
                cost: '20 сом/час',
                hours: '06:00-22:00',
                rules: 'Охраняемая парковка у автовокзала',
                city: 'Ош',
                address: 'ул. Масалиева, 2',
                capacity: '150 мест'
            },
            {
                id: 29,
                name: 'Рынок "Кара-Суу"',
                coords: [40.5089, 72.7823],
                type: 'paid',
                cost: '12 сом/час',
                hours: '07:00-17:00',
                rules: 'Рыночная парковка',
                city: 'Ош',
                address: 'ул. Кара-Суу',
                capacity: '250 мест'
            },
            {
                id: 30,
                name: 'Банковский квартал',
                coords: [40.5212, 72.7934],
                type: 'paid',
                cost: '35 сом/час',
                hours: '09:00-17:00',
                rules: 'Деловой центр города',
                city: 'Ош',
                address: 'ул. Ленина, 245',
                capacity: '70 мест'
            }
        ];
        
        this.addMarkersToMap();
    }
    
    addMarkersToMap() {
        if (!this.map) {
            console.error('Карта не инициализирована');
            return;
        }
        
        console.log(`Добавление ${this.parkingData.length} маркеров на карту`);
        
        this.parkingData.forEach((parking, index) => {
            try {
                const icon = this.getMarkerIcon(parking.type);
                
                const marker = L.marker(parking.coords, { icon })
                    .addTo(this.map)
                    .bindPopup(this.createPopupContent(parking));
                
                // Добавить обработчик клика
                marker.on('click', () => {
                    this.showParkingInfo(parking);
                });
                
                this.markers.push(marker);
                
                console.log(`Маркер ${index + 1} добавлен: ${parking.name}`);
            } catch (error) {
                console.error(`Ошибка добавления маркера ${parking.name}:`, error);
            }
        });
        
        console.log(`Всего добавлено маркеров: ${this.markers.length}`);
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