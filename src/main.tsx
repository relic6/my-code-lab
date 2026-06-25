import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// 动态获取基准路由路径，去除尾部斜杠
const baseName = import.meta.env.BASE_URL === '/' ? undefined : '/mycodelab';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
