import type { Dish, CachedImage } from '../types';

// 创建缓存的菜品图像
export function createCachedDishImage(img: HTMLImageElement, dishName: string): HTMLCanvasElement {
  // 创建离屏Canvas用于缓存图像
  const cacheCanvas = document.createElement('canvas');
  const size = 120; // 缓存图像的尺寸
  cacheCanvas.width = size;
  cacheCanvas.height = size;
  const cacheCtx = cacheCanvas.getContext('2d');
  
  if (!cacheCtx) return cacheCanvas;

  // 绘制圆形裁剪区域
  cacheCtx.beginPath();
  cacheCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  cacheCtx.closePath();
  cacheCtx.clip();

  // 计算图像缩放和位置，以适应圆形区域并保持比例
  const scale = Math.max(size / img.width, size / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const x = (size - scaledWidth) / 2;
  const y = (size - scaledHeight) / 2;

  // 绘制图像
  cacheCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

  // 添加圆形边框
  cacheCtx.strokeStyle = 'rgba(255,255,255,0.8)';
  cacheCtx.lineWidth = 2;
  cacheCtx.beginPath();
  cacheCtx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  cacheCtx.stroke();

  return cacheCanvas;
}

// 预加载函数，返回Promise以便在完成后进行后续操作
export function preloadAllImages(dishList: Dish[]): Promise<Record<string, CachedImage>> {
  return new Promise((resolve) => {
    const dishImages: Record<string, CachedImage> = {};
    const totalImages = dishList.length;
    let imagesLoaded = 0;

    dishList.forEach(dish => {
      // 创建缩略图尺寸，减少内存使用
      const img = new Image();
      img.crossOrigin = "Anonymous"; // 处理可能的跨域问题

      // 图片加载完成事件
      img.onload = () => {
        // 创建缓存的图像对象
        const cachedImg = createCachedDishImage(img, dish.name);
        dishImages[dish.name] = {
          original: img,
          cached: cachedImg
        };

        imagesLoaded++;

        // 所有图片加载完成后，确保按钮可用
        if (imagesLoaded === totalImages) {
          resolve(dishImages);
        }
      };

      // 错误处理
      img.onerror = () => {
        console.warn(`无法加载图片: ${dish.name}`);
        imagesLoaded++;

        // 提供默认图像
        const defaultImg = new Image();
        defaultImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>';
        dishImages[dish.name] = {
          original: defaultImg,
          cached: null
        };

        // 所有图片处理完成
        if (imagesLoaded === totalImages) {
          resolve(dishImages);
        }
      };

      // 开始加载图片
      img.src = dish.image;
    });
  });
} 