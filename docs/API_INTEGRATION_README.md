# 用户注册接口对接说明

## 概述

本项目已经完成了用户注册接口的对接，包括：

- 用户注册
- 验证码发送
- 验证码验证
- 手机号检查

## 配置说明

### 1. 后端服务器配置

项目使用 Vite 代理将`/api`请求转发到后端服务器。在`vite.config.ts`中已配置：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000', // 后端服务器地址
    changeOrigin: true,
  },
},
```

**请确保后端服务器运行在 `http://localhost:8000`**

### 2. 环境变量配置

如果需要修改 API 地址，可以在项目根目录创建`.env.local`文件：

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_REQUEST_TIMEOUT=10000
```

## API 接口说明

### 用户注册流程

1. **发送验证码**

   - 接口：`POST /api/verification/send-code`
   - 参数：
     ```json
     {
       "phone": "13800138000",
       "code_type": "register"
     }
     ```

2. **验证码验证**（可选）

   - 接口：`POST /api/verification/verify-code`
   - 参数：
     ```json
     {
       "phone": "13800138000",
       "code": "123456",
       "code_type": "register"
     }
     ```

3. **用户注册**
   - 接口：`POST /api/auth/register`
   - 参数：
     ```json
     {
       "username": "用户名",
       "phone": "13800138000",
       "password": "密码",
       "verification_code": "123456"
     }
     ```

### 响应格式

注册成功响应：

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_id": 1,
  "username": "用户名",
  "avatar_url": null
}
```

## 测试步骤

### 1. 启动后端服务器

确保后端服务器运行在 `http://localhost:8000`

### 2. 启动前端项目

```bash
npm run dev
```

### 3. 测试注册流程

1. 访问注册页面
2. 输入用户名和手机号
3. 点击"发送验证码"
4. 输入收到的验证码
5. 设置密码并确认
6. 点击"注册"按钮

### 4. 检查网络请求

在浏览器开发者工具的 Network 标签页中查看：

- 验证码发送请求
- 用户注册请求
- 响应状态和内容

## 错误处理

### 常见错误

1. **手机号已被注册**

   - 错误码：409
   - 处理：提示用户手机号已被使用

2. **验证码错误**

   - 错误码：422
   - 处理：提示用户验证码错误

3. **网络错误**
   - 错误码：500
   - 处理：提示用户稍后重试

### 错误响应格式

```json
{
  "detail": [
    {
      "loc": ["body", "phone"],
      "msg": "手机号已被注册",
      "type": "value_error"
    }
  ]
}
```

## 调试技巧

### 1. 查看控制台日志

所有 API 请求和响应都会在控制台输出，便于调试。

### 2. 使用浏览器代理

如果后端服务器不在本地，可以修改`vite.config.ts`中的 target 地址。

### 3. 检查 CORS 配置

确保后端服务器允许来自`http://localhost:3000`的请求。

## 注意事项

1. **验证码有效期**：验证码通常有 5 分钟有效期
2. **手机号格式**：只支持中国大陆手机号格式（1 开头，11 位）
3. **密码强度**：建议密码至少 6 位
4. **用户名唯一性**：用户名在系统中必须唯一

## 后续功能

注册成功后，用户将自动登录并跳转到首页。后续可以添加：

- 邮箱验证
- 用户资料完善
- 偏好设置
- 头像上传

## 技术支持

如果遇到问题，请检查：

1. 后端服务器是否正常运行
2. 网络请求是否被正确代理
3. API 响应格式是否符合预期
4. 控制台是否有错误信息
