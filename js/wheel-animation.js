/**
 * 拨轮动画效果
 * @param {HTMLElement} container - 动画容器元素
 * @param {HTMLElement} currentElement - 当前显示的元素
 * @param {HTMLElement} nextElement - 即将显示的元素
 * @param {Function} callback - 动画完成后的回调函数
 */
function wheelAnimation(container, currentElement, nextElement, callback) {
    // 添加动画类到容器
    container.classList.add('device-wheel-next');

    // 动画进行到一半时，切换显示的元素
    setTimeout(() => {
        // 切换元素的显示状态
        if (currentElement.classList.contains('active')) {
            currentElement.classList.remove('active');
        }
        nextElement.classList.add('active');

        // 移除旧动画，添加新动画
        container.classList.remove('device-wheel-next');
        container.classList.add('device-wheel-prev');

        // 动画结束后清理
        setTimeout(() => {
            // 清除所有动画类
            container.classList.remove('device-wheel-prev');

            // 执行回调函数(如果有)
            if (typeof callback === 'function') {
                callback();
            }
        }, 500); // 动画完成时间

    }, 300); // 半动画时间
} 