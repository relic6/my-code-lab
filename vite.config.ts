import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// 递归拷贝文件夹的辅助函数
function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      {
        name: 'copy-components-plugin',
        closeBundle() {
          if (command === 'build') {
            const src = path.resolve(process.cwd(), 'components');
            const dest = path.resolve(process.cwd(), 'dist/components');
            if (fs.existsSync(src)) {
              console.log('正在拷贝 components 目录到 dist/components...');
              copyDir(src, dest);
              console.log('components 目录拷贝完成！');
            } else {
              console.warn('未找到 components 目录，跳过拷贝。');
            }
          }
        },
      },
    ],
    base: command === 'build' ? '/mycodelab/' : '/',
  };
});

