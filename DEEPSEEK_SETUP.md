# DeepSeek AI 推荐配置指南

本项目已集成 DeepSeek AI 推荐功能，可以在有网络的时候使用 AI 推荐，无网络时自动降级到本地算法。

## 环境变量配置

### 1. 创建环境配置文件

在项目根目录创建 `.env.local` 文件（此文件不会被版本控制）：

```bash
# DeepSeek AI API 配置
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_API_KEY=你的DeepSeek_API_密钥
VITE_DEEPSEEK_MODEL=deepseek-chat
```

### 2. 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册并登录账户
3. 前往 [API Keys 页面](https://platform.deepseek.com/api_keys)
4. 创建新的 API Key
5. 将获得的 API Key 填入上面的 `VITE_DEEPSEEK_API_KEY` 配置中

### 3. 环境变量说明

- `VITE_DEEPSEEK_API_URL`: DeepSeek API 的请求地址（通常无需修改）
- `VITE_DEEPSEEK_API_KEY`: 你的 DeepSeek API 密钥（必填）
- `VITE_DEEPSEEK_MODEL`: 使用的模型名称（推荐使用 `deepseek-chat`）

## 功能特性

### 智能推荐模式

1. **在线模式**：

   - 使用 DeepSeek AI 进行智能推荐
   - 考虑天气、时间、心情、季节等多个因素
   - 提供自然语言的推荐理由

2. **离线模式**：

   - 自动降级到本地算法
   - 基于预设规则进行推荐
   - 保证离线状态下的正常使用

3. **混合模式**：
   - 优先使用 AI 推荐
   - AI 失败时自动降级到本地算法
   - 智能缓存减少 API 调用

### 用户界面指示

- 🤖 **AI 智能推荐**：网络在线且 API 可用时显示
- 🔮 **智能推荐**：仅本地算法可用时显示
- 📴 **离线模式**：网络断开时显示

## 开发调试

### 查看推荐来源

每个推荐结果都包含 `source` 字段：

- `'ai'`：来自 DeepSeek AI
- `'local'`：来自本地算法

### 控制台日志

系统会在控制台输出详细的推荐过程信息：

- 网络状态变化
- AI 推荐尝试和失败
- 降级到本地算法的原因

### 推荐策略配置

可以通过 `hybridRecommendationService.setStrategy()` 方法切换推荐策略：

```typescript
import { hybridRecommendationService } from '@/utils/hybridRecommendationService';
import { RecommendationStrategy } from '@/types';

// 仅使用 AI
hybridRecommendationService.setStrategy(RecommendationStrategy.AI_ONLY);

// 仅使用本地算法
hybridRecommendationService.setStrategy(RecommendationStrategy.LOCAL_ONLY);

// 混合模式（默认）
hybridRecommendationService.setStrategy(RecommendationStrategy.HYBRID);

// 对比模式（同时使用两种算法）
hybridRecommendationService.setStrategy(RecommendationStrategy.COMPARE);
```

## 注意事项

1. **API 成本**：每次 AI 推荐都会消耗 DeepSeek API 配额，请合理使用
2. **网络延迟**：AI 推荐可能需要几秒钟的响应时间
3. **降级机制**：系统会在 AI 不可用时自动降级，确保用户体验
4. **隐私保护**：用户的菜品偏好等数据会发送到 DeepSeek API 进行分析

## 故障排除

### 常见问题

1. **API Key 无效**

   - 检查 `.env.local` 文件中的 API Key 是否正确
   - 确认 API Key 没有过期
   - 检查是否有足够的 API 配额

2. **网络连接问题**

   - 检查网络连接
   - 确认防火墙没有阻止对 DeepSeek API 的访问

3. **推荐失败**
   - 查看浏览器控制台的错误信息
   - 系统会自动降级到本地算法，不影响基本功能

### 调试命令

```javascript
// 在浏览器控制台执行以下命令查看推荐服务状态
console.log(hybridRecommendationService.getStats());

// 清空推荐缓存
hybridRecommendationService.clearCache();

// 检查是否可以使用 AI
console.log(hybridRecommendationService.canUseAI());
```

## 更新日志

- v1.0.0: 初始版本，支持 DeepSeek AI 推荐和本地算法混合模式
