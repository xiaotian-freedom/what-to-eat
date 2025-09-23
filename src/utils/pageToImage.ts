// 引入 html2canvas 库
import html2canvas, { type Options as Html2CanvasOptions } from 'html2canvas';

// 定义转换结果的类型
interface ConvertResult {
  dataUrl: string; // Base64 格式的图片数据
  blob?: Blob; // 可选的 Blob 对象
  error?: Error; // 错误信息
}

/**
 * 一个用于将 Vue 页面或 DOM 元素转换为图片的工具类。
 */
export class VuePageToImage {
  private options: Partial<Html2CanvasOptions>;

  /**
   * 构造函数，接收 html2canvas 的配置选项。
   * @param options 可选的 html2canvas 配置对象。
   */
  constructor(options: Partial<Html2CanvasOptions> = {}) {
    this.options = options;
  }

  /**
   * 将一个 DOM 元素转换为图片。
   * @param element 要转换的 DOM 元素。
   * @returns 返回一个 Promise，包含转换结果。
   */
  public async convert(element: HTMLElement): Promise<ConvertResult> {
    if (!element) {
      return {
        dataUrl: '',
        error: new Error('The element to be converted is not a valid HTMLElement.'),
      };
    }

    try {
      // 使用 html2canvas 将 DOM 元素渲染为 canvas
      const canvas = await html2canvas(element, this.options);

      // 将 canvas 转换为 base64 格式的图片数据
      const dataUrl = canvas.toDataURL('image/png');

      // 将canvas转换为blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片生成失败'));
            }
          },
          'image/png',
          0.9
        );
      });

      return {
        dataUrl,
        // 如果需要，可以生成 Blob 对象
        blob,
      };
    } catch (error) {
      console.error('Error during image conversion:', error);
      return {
        dataUrl: '',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * 将转换后的图片下载到本地。
   * @param dataUrl Base64 格式的图片数据。
   * @param filename 下载的文件名，默认为 'download.png'。
   */
  public downloadImage(dataUrl: string, filename: string = 'download.png'): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 示例用法
// const converter = new VuePageToImage({
//   // 这里可以传入 html2canvas 的配置，例如
//   // backgroundColor: '#ffffff',
//   // scale: 2, // 提高分辨率
// });
