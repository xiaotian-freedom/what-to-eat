import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
    const svgPath = path.join(__dirname, '../public/icon.svg');
    const outputDir = path.join(__dirname, '../public');

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const sizes = [
        { name: 'pwa-192x192.png', size: 192 },
        { name: 'pwa-512x512.png', size: 512 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'favicon-16x16.png', size: 16 },
    ];

    console.log('开始生成图标...');

    for (const { name, size } of sizes) {
        try {
            await sharp(svgPath)
                .resize(size, size)
                .png()
                .toFile(path.join(outputDir, name));

            console.log(`✅ 生成 ${name} (${size}x${size})`);
        } catch (error) {
            console.error(`❌ 生成 ${name} 失败:`, error.message);
        }
    }

    console.log('图标生成完成！');
}

generateIcons().catch(console.error);
