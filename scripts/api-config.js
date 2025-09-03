// API 配置文件
export const API_CONFIG = {
    // API 服务器地址
    BASE_URL: 'http://localhost:8000',

    // OpenAPI 规范文件路径
    OPENAPI_PATH: '/openapi.json',

    // 输出文件路径
    OUTPUT_FILE: 'src/types/api.ts',

    // 是否启用 Prettier 格式化
    ENABLE_PRETTIER: true,

    // 是否在生成后显示文件信息
    SHOW_FILE_INFO: true,

    // 超时设置（毫秒）
    TIMEOUT: 30000,
};

// 获取完整的 OpenAPI URL
export const getOpenApiUrl = () => `${API_CONFIG.BASE_URL}${API_CONFIG.OPENAPI_PATH}`;

// 获取输出文件路径
export const getOutputFile = () => API_CONFIG.OUTPUT_FILE;

// 获取 openapi-typescript 命令参数
export const getCommandArgs = () => {
    const args = [
        getOpenApiUrl(),
        '-o', getOutputFile(),
    ];

    if (API_CONFIG.ENABLE_PRETTIER) {
        args.push('--prettier');
    }

    return args;
};
