import { init, type QiniuConfig } from './qiniu';
import request from './request';

export interface UploadData {
  token: string;
  domain: string;
  key: string;
}

// 初始化七牛云相关配置
export const initQiniu = (token: string, fileName: string, domain: string) => {
  const options: QiniuConfig = {
    key: fileName,
    qiniuRegion: 'SCN',
    qiniuUploadToken: token,
    qiniuUploadTokenURL: '',
    qiniuUploadTokenFunction: () => '',
    qiniuBucketURLPrefix: domain,
    qiniuShouldUseQiniuFileName: false,
  };
  // 将七牛云相关配置初始化进本sdk
  init(options);
};

/**
 * 获取七牛云上传token
 */
export const getUploadToken = () => {
  return request.get('/api/upload/qiniu-token');
};

/**
 * 获取地址后缀名
 * @param {*} filePath
 */
export const getSuffix = (filePath: string) => {
  let suffix = '';
  if (filePath.includes('.')) {
    const typeArr = filePath.split('.');
    if (typeArr && typeArr.length > 0) {
      suffix = typeArr[1];
    }
  }
  return suffix;
};
