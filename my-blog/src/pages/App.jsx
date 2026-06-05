import { useState, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Home from './Home';
import WriteBlog from './WriteBlog';
import Login from './Login';
import '../css/App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 세션 확인 및 초기 상태 설정
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // 2. 인증 상태 변화 감지 및 1시간 자동 로그아웃 설정
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // 세션이 있을 때만 타이머 가동 (로그아웃 시에는 타이머 필요 없음)
      if (session) {
        // 기존 타이머를 clear하고 새로 시작하는 로직은 하단 return에서 처리
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1시간 타이머 별도 관리 (세션 존재 시 항상 체크)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(
        async () => {
          await supabase.auth.signOut();
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.reload();
        },
        60 * 60 * 1000,
      ); // 1시간

      return () => clearTimeout(timer); // 유저 상태 변경 시 이전 타이머 제거
    }
  }, [user]);

  if (loading) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="nav-bar">
          <div className="w-full flex items-center justify-between px-6 py-4">
            <a href="/" className="nav-logo">
              ShareLog
            </a>
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="nav-login-btn cursor-pointer"
                >
                  로그아웃
                </button>
              ) : (
                <Link to="/login" className="nav-login-btn">
                  로그인
                </Link>
              )}
              <Link to="/write" className="nav-write-btn">
                글쓰기
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            {/* 💡 핵심 수정: 루트 경로(/) 접속 시 로그인 여부에 따라 리다이렉트 */}
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />

            <Route
              path="/write"
              element={user ? <WriteBlog /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />

            {/* 홈 외의 주소로 직접 접근 시 안전하게 처리 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
