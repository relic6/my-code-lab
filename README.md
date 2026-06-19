# My Code Lab

收集好用、好看、值得复用或参考的前端组件与效果实现。仓库同时支持 React 组件、纯 HTML/CSS 页面，以及后续的 CSS、Canvas、Three.js 等实验。

## 启动预览

第一次使用：

```bash
npm install
npm run dev
```

然后打开：

```text
http://127.0.0.1:5174/
```

常用命令：

```bash
npm run dev      # 本地开发预览
npm run build    # 类型检查并构建
npm run preview  # 预览构建结果
npm run lint     # 静态检查
```

## 目录约定

```text
components/
  react/
    component-name/
      ComponentName.tsx
      index.ts
  html/
    effect-name/
      index.html
  css/
    effect-name/
      index.html
      style.css
src/
  App.tsx          # 预览壳
  catalog.tsx      # 示例目录注册
  main.tsx
  styles.css
```

## 新增 React 示例

1. 新建目录：`components/react/my-component/`
2. 添加组件：`MyComponent.tsx`
3. 添加导出：`index.ts`
4. 在 `src/catalog.tsx` 注册：

```tsx
{
  id: 'my-component',
  title: 'My Component',
  category: 'react',
  description: '一句话说明这个组件或效果。',
  tags: ['react', 'animation'],
  sourcePath: 'components/react/my-component/MyComponent.tsx',
  Component: MyComponent,
}
```

## 新增 HTML/CSS 示例

1. 新建目录：`components/html/my-effect/`
2. 添加入口：`index.html`
3. 在 `src/catalog.tsx` 注册：

```tsx
{
  id: 'my-effect',
  title: 'My Effect',
  category: 'html',
  description: '一句话说明这个页面或效果。',
  tags: ['html', 'css'],
  sourcePath: 'components/html/my-effect/index.html',
  previewUrl: '/components/html/my-effect/index.html',
}
```

原则：源码按实现类型归档，预览入口统一从 `src/catalog.tsx` 管理。
