// Простой генератор иконки для Node.js (если доступен)
// Или можно использовать create-icons.html в браузере

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Фон
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(1, '#1976D2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Белый круг в центре
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
    
    return canvas.toBuffer('image/png');
}

// Создать иконки разных размеров
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    try {
        const buffer = generateIcon(size);
        fs.writeFileSync(`icons/icon-${size}x${size}.png`, buffer);
        console.log(`Создана иконка ${size}x${size}`);
    } catch (error) {
        console.log(`Не удалось создать иконку ${size}x${size}:`, error.message);
    }
});

console.log('Генерация иконок завершена. Если canvas недоступен, используйте create-icons.html в браузере.');