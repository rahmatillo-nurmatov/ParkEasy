// Создание базовых иконок через canvas (для Node.js или браузера)
function createBasicIcon(size) {
    // Создаем SVG строку
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#2196F3" rx="${size * 0.125}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
        <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial" font-size="${size/3}" font-weight="bold" text-anchor="middle" fill="#2196F3">P</text>
    </svg>`;
    
    return svg;
}

// Создать data URL для иконки
function createIconDataURL(size) {
    const svg = createBasicIcon(size);
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Если запускается в браузере
if (typeof window !== 'undefined') {
    console.log('Создание иконок в браузере...');
    
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        
        // Фон
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(0, 0, size, size);
        
        // Скругленные углы (совместимый способ)
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        const radius = size * 0.125;
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        
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
        
        // Создать ссылку для скачивания
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icon-${size}x${size}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
}

console.log('Скрипт создания иконок готов');