import { showSuccessToast } from 'vant';

/**
 * 图片分享工具类
 * 用于将DOM元素转换为图片并进行分享
 */
export class ImageShareUtil {
  /**
   * 分享图片blob
   * @param blob 图片blob
   * @param filename 文件名
   */
  public static async shareImageBlob(blob: Blob, filename: string): Promise<void> {
    // 检查是否支持Web Share API且支持文件分享
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });

        // 检查是否可以分享文件
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '分享菜谱',
            text: '来自"今天吃什么"的菜谱分享',
            files: [file],
          });
          showSuccessToast('分享成功！');
          return;
        }
      } catch (error) {
        console.log('Web Share API 分享失败，回退到下载方式:', error);
      }
    }

    // 回退到下载方式
    this.downloadImageBlob(blob, filename);
  }

  /**
   * 下载图片blob
   * @param blob 图片blob
   * @param filename 文件名
   */
  private static downloadImageBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);

    showSuccessToast('图片已保存到相册');
  }
}
