# API 类型生成

本项目使用 `openapi-typescript` 来自动生成 TypeScript 类型定义，基于 OpenAPI 规范文件。

## 功能特性

- 🚀 自动从 OpenAPI 规范生成 TypeScript 类型
- 📝 支持 Prettier 代码格式化
- ⚙️ 可配置的 API 地址和输出路径
- 🔍 详细的错误处理和提示信息
- 📊 生成后显示文件信息

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 生成 API 类型

```bash
npm run generate-api-types
```

### 3. 使用生成的类型

```typescript
import type { paths, operations } from '@/types/api';

// 使用路径类型
type RegisterEndpoint = paths['/api/auth/register'];
type LoginEndpoint = paths['/api/auth/login'];

// 使用操作类型
type RegisterUser = operations['register_user_api_auth_register_post'];
type LoginUser = operations['login_for_access_token_api_auth_login_post'];
```

## 配置

配置文件位于 `scripts/api-config.js`，可以修改以下设置：

```javascript
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
```

## 脚本说明

### generate-api-types

主要的类型生成脚本，位于 `scripts/generate-api-types.js`：

- 自动创建输出目录
- 执行 openapi-typescript 命令
- 提供详细的执行信息
- 错误处理和用户友好的提示

### 环境要求

- Node.js 16+
- npm 或 yarn
- 可访问的 OpenAPI 服务器

## 故障排除

### 连接被拒绝

```
❌ 生成 API 类型定义时发生错误: ECONNREFUSED
💡 提示: 请确保 API 服务器正在运行在 http://localhost:8000
   或者检查 API 地址是否正确
```

**解决方案：**

1. 检查 API 服务器是否正在运行
2. 验证 `scripts/api-config.js` 中的 `BASE_URL` 设置
3. 确认防火墙设置允许连接

### 请求超时

```
❌ 生成 API 类型定义时发生错误: timeout
💡 提示: 请求超时，请检查网络连接或增加超时时间
```

**解决方案：**

1. 检查网络连接
2. 在 `scripts/api-config.js` 中增加 `TIMEOUT` 值
3. 检查 API 服务器响应时间

## 最佳实践

1. **定期更新类型**：当 API 发生变化时，重新运行生成脚本
2. **版本控制**：将生成的类型文件纳入版本控制
3. **CI/CD 集成**：在构建流程中自动生成类型定义
4. **类型检查**：在开发过程中使用生成的类型进行类型检查

## 相关文件

- `scripts/generate-api-types.js` - 主要的生成脚本
- `scripts/api-config.js` - 配置文件
- `src/types/api.ts` - 生成的类型定义文件
- `src/types/index.ts` - 类型导出文件
- `package.json` - npm 脚本配置
