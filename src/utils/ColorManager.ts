/**
 * 颜色管理类
 * 用于生成和管理应用中使用的颜色
 */
export class ColorManager {
  // 预定义的调色板 - 柔和现代的颜色
  private static readonly palette: string[] = [
    '#FF6B6B', // 红色
    '#FF9E7D', // 橙色
    '#FFCE67', // 黄色
    '#88D9A0', // 绿色
    '#4ECDC4', // 青色
    '#59A5D8', // 蓝色
    '#9D65C9', // 紫色
    '#EA8BC9', // 粉色
    '#607D8B', // 蓝灰色
    '#78909C', // 灰色
  ];

  /**
   * 获取随机颜色
   * @returns 十六进制颜色代码
   */
  public static getRandomColor(): string {
    const index = Math.floor(Math.random() * this.palette.length);
    return this.palette[index];
  }

  /**
   * 生成完全随机的颜色（不限于预定义调色板）
   * @returns 十六进制颜色代码
   */
  public static generateRandomColor(): string {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  /**
   * 根据类别名称获取一致的颜色
   * 相同的类别名称将始终返回相同的颜色
   * @param category 类别名称
   * @returns 十六进制颜色代码
   */
  public static getColorForCategory(category: string): string {
    // 简单的散列函数，将类别名转换为调色板索引
    let hashCode = 0;
    for (let i = 0; i < category.length; i++) {
      hashCode = category.charCodeAt(i) + ((hashCode << 5) - hashCode);
    }

    // 确保是正数并映射到调色板范围内
    const index = Math.abs(hashCode) % this.palette.length;
    return this.palette[index];
  }
}
