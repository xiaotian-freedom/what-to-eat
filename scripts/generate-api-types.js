#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { API_CONFIG, getOpenApiUrl, getOutputFile, getCommandArgs } from './api-config.js';

console.log('🚀 开始生成 API 类型定义...');
console.log(`📍 API 地址: ${getOpenApiUrl()}`);
console.log(`📁 输出文件: ${getOutputFile()}`);

try {
    // 检查输出目录是否存在
    const outputDir = path.dirname(getOutputFile());
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 创建目录: ${outputDir}`);
    }

    // 构建命令
    const args = getCommandArgs();
    const command = `npx openapi-typescript ${args.join(' ')}`;
    console.log(`🔧 执行命令: ${command}`);

    // 执行命令
    execSync(command, {
        stdio: 'inherit',
        timeout: API_CONFIG.TIMEOUT
    });

    console.log(`✅ API 类型定义已成功生成到: ${getOutputFile()}`);

    // 检查生成的文件
    if (fs.existsSync(getOutputFile())) {
        const stats = fs.statSync(getOutputFile());
        console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

        if (API_CONFIG.SHOW_FILE_INFO) {
            // 读取文件头部信息
            const content = fs.readFileSync(getOutputFile(), 'utf8');
            const lines = content.split('\n').slice(0, 10);
            console.log('📝 文件头部内容:');
            lines.forEach(line => console.log(`   ${line}`));
        }
    }

} catch (error) {
    console.error('❌ 生成 API 类型定义时发生错误:');
    console.error(error.message);

    if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 提示: 请确保 API 服务器正在运行在', API_CONFIG.BASE_URL);
        console.log('   或者检查 API 地址是否正确');
    } else if (error.message.includes('timeout')) {
        console.log('\n💡 提示: 请求超时，请检查网络连接或增加超时时间');
    }

    process.exit(1);
}
