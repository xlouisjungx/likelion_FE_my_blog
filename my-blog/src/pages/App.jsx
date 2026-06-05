// src/pages/App.jsx
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './Home';
import WriteBlog from './WriteBlog';
import '../css/App.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="nav-bar">
          {/* 💡 핵심 교정 파트: 
            기존 max-w-3xl(가로폭 제한)을 제거하고 w-full(100% 꽉 채움)로 변경,
            px-6(좌우 여백)을 주어 어떤 기기에서든 양 끝 모서리에 너무 붙지 않게 안정감을 줍니다.
          */}
          <div className="w-full flex items-center justify-between px-6 py-4">
            {/* 👈 무조건 맨 왼쪽에 위치 (ShareLog) */}
            <a href="/" className="nav-logo">
              ShareLog
            </a>

            {/* 👉 무조건 맨 오른쪽에 위치 (글쓰기) */}
            <Link to="/write" className="nav-write-btn">
              글쓰기
            </Link>
          </div>
        </nav>

        {/* 💡 클래스 추가: 배경의 디지털 격자무늬(Grid)와 실시간 테크 광원 애니메이션이 정상 출력되도록 바인딩 */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/write" element={<WriteBlog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
