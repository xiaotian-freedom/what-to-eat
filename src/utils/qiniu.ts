import { uploadFile } from "./request";

// 定义一个类型接口，以明确配置对象的结构
export interface QiniuConfig {
  key: string;
  qiniuRegion: string;
  qiniuBucketURLPrefix: string;
  qiniuUploadToken: string;
  qiniuUploadTokenURL: string;
  qiniuUploadTokenFunction: () => string;
  qiniuShouldUseQiniuFileName: boolean;
}

// 初始配置
const config: QiniuConfig = {
  key: "",
  qiniuRegion: "",
  qiniuBucketURLPrefix: "",
  qiniuUploadToken: "",
  qiniuUploadTokenURL: "",
  qiniuUploadTokenFunction: () => "",
  qiniuShouldUseQiniuFileName: false,
};

// 更新配置的函数
function updateConfigWithOptions(options: Partial<QiniuConfig>): void {
  if (options.key) {
    config.key = options.key;
  }
  if (options.qiniuRegion) {
    config.qiniuRegion = options.qiniuRegion;
  } else {
    console.error("Qiniu uploader needs your bucket region");
  }
  if (options.qiniuUploadToken) {
    config.qiniuUploadToken = options.qiniuUploadToken;
  } else if (options.qiniuUploadTokenURL) {
    config.qiniuUploadTokenURL = options.qiniuUploadTokenURL;
  } else if (options.qiniuUploadTokenFunction) {
    config.qiniuUploadTokenFunction = options.qiniuUploadTokenFunction;
  }
  if (options.qiniuBucketURLPrefix) {
    config.qiniuBucketURLPrefix = options.qiniuBucketURLPrefix;
  }
  if (typeof options.qiniuShouldUseQiniuFileName === "boolean") {
    config.qiniuShouldUseQiniuFileName = options.qiniuShouldUseQiniuFileName;
  }
}

// 初始化函数
function init(options: Partial<QiniuConfig>): void {
  updateConfigWithOptions(options);
}

function upload(
  file: File,
  success?: (data: any) => void,
  fail?: (error: any) => void,
  complete?: () => void,
  options?: Partial<QiniuConfig>,
  progress?: (res: { progress: number }) => void,
  cancelTask?: (abort: () => void) => void
) {
  if (!file) {
    console.error("qiniu uploader need file to upload");
    return;
  }

  if (options) {
    updateConfigWithOptions(options);
  }

  if (
    !config.qiniuUploadToken &&
    !config.qiniuUploadTokenURL &&
    !config.qiniuUploadTokenFunction
  ) {
    console.error(
      "qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]"
    );
    return;
  }

  // 确保 token 是可用的，或者从 URL/function 获取 token
  function ensureTokenAvailable(callback: () => void) {
    if (config.qiniuUploadToken) {
      callback();
    } else if (config.qiniuUploadTokenFunction) {
      config.qiniuUploadToken = config.qiniuUploadTokenFunction();
      if (!config.qiniuUploadToken) {
        console.error(
          "qiniu UploadTokenFunction result is null, please check the return value"
        );
        return;
      }
      callback();
    }
  }

  ensureTokenAvailable(() => {
    const uploadURL = uploadURLFromRegionCode(config.qiniuRegion);
    let fileName = file.name;
    if (config && config.key) {
      fileName = config.key;
    }

    const formData = {
      token: config.qiniuUploadToken,
      key: config.qiniuShouldUseQiniuFileName ? undefined : fileName,
    };

    uploadFile({
      url: uploadURL,
      file: file,
      name: "file",
      formData,
      success: (res: any) => {
        success && success(res);
      },
      fail: (error) => {
        console.error("Upload failed:", error);
        fail && fail(error);
      },
      complete,
      progress,
      cancelTask,
    });
  });
}

function uploadURLFromRegionCode(code: string): string {
  switch (code) {
    case "ECN":
      return "https://up.qiniup.com";
    case "NCN":
      return "https://up-z1.qiniup.com";
    case "SCN":
      return "https://up-z2.qiniup.com";
    case "NA":
      return "https://up-na0.qiniup.com";
    case "ASG":
      return "https://up-as0.qiniup.com";
    default:
      console.error("无效的区域代码");
      return "https://up.qiniup.com";
  }
}

// 导出的模块功能
export { init, upload, updateConfigWithOptions };
