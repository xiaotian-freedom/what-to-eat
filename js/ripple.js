/**
 * 水波纹效果初始化函数
 * 为所有带有ripple-btn类的元素添加水波纹效果
 */
function initRippleEffect() {
    const rippleButtons = document.querySelectorAll('.ripple-btn');

    rippleButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // 创建水波纹元素
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            // 获取点击相对于按钮的位置
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 设置水波纹元素的位置和尺寸
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0';
            ripple.style.height = '0';

            // 计算水波纹尺寸 - 确保足够大以覆盖整个按钮
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';

            // 调整水波纹的起始位置，使其居中于点击点
            ripple.style.left = (x - size / 2) + 'px';
            ripple.style.top = (y - size / 2) + 'px';

            // 添加水波纹元素到按钮
            button.appendChild(ripple);

            // 动画结束后移除水波纹元素
            setTimeout(() => {
                ripple.remove();
            }, 600); // 与动画时长相同
        });
    });
}

// 页面加载完成后初始化水波纹效果
document.addEventListener('DOMContentLoaded', initRippleEffect); 