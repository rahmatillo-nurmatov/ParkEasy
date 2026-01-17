// Генерация базовых иконок в формате base64 для GitHub Pages
// Запустите этот файл в браузере для создания иконок

function generateIconBase64(size) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    // Фон
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, size, size);
    
    // Белый круг
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Символ P
    ctx.fillStyle = '#2196F3';
    ctx.font = `bold ${size/3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', size/2, size/2);
    
    return canvas.toDataURL('image/png');
}

// Создать все иконки
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const icons = {};

iconSizes.forEach(size => {
    icons[size] = generateIconBase64(size);
});

console.log('Базовые иконки созданы:', icons);

// Функция для скачивания иконки
function downloadIconFromBase64(size) {
    const dataUrl = icons[size];
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `icon-${size}x${size}.png`;
    link.click();
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { icons, downloadIconFromBase64 };
}