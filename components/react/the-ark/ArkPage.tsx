import { Link } from 'react-router-dom';
import styled from 'styled-components';
import TheArk from './TheArk';

/**
 * 独立全屏路由页：整页 Lenis 平滑滚动的 Ark，
 * 左上角悬浮一个返回 Lab 的按钮。
 */
export default function ArkPage() {
  return (
    <Full>
      <Link className="back" to="/">← Lab</Link>
      <TheArk fullscreen />
    </Full>
  );
}

const Full = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #13121a;

  .back {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 100;
    padding: 8px 16px;
    border-radius: 40px;
    background: rgba(255, 255, 255, 0.9);
    color: #13121a;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    backdrop-filter: blur(6px);
  }
`;
