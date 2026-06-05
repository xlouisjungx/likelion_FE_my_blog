import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 배경 애니메이션 로직 유지
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createLine = () => {
      const isHorizontal = Math.random() > 0.5;
      return {
        x: isHorizontal
          ? Math.random() > 0.5
            ? 0
            : canvas.width
          : Math.random() * canvas.width,
        y: isHorizontal
          ? Math.random() * canvas.height
          : Math.random() > 0.5
            ? 0
            : canvas.height,
        length: Math.random() * 120 + 60,
        speed: Math.random() * 1.5 + 0.8,
        dirX: isHorizontal ? (Math.random() > 0.5 ? 1 : -1) : 0,
        dirY: isHorizontal ? 0 : Math.random() > 0.5 ? 1 : -1,
        opacity: Math.random() * 0.4 + 0.1,
        width: Math.random() * 1.5 + 0.5,
      };
    };

    let lines = Array.from({ length: 25 }, createLine);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.lineWidth = line.width;
        ctx.strokeStyle = `rgba(45, 212, 191, ${line.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(45, 212, 191, 0.6)';
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(
          line.x - line.dirX * line.length,
          line.y - line.dirY * line.length,
        );
        ctx.stroke();
        line.x += line.dirX * line.speed;
        line.y += line.dirY * line.speed;
        if (Math.random() < 0.003) {
          const temp = line.dirX;
          line.dirX = line.dirY;
          line.dirY = temp;
        }
        if (
          line.x < -150 ||
          line.x > canvas.width + 150 ||
          line.y < -150 ||
          line.y > canvas.height + 150
        ) {
          lines[index] = createLine();
        }
      });
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) setErrorMsg(`로그인 실패: ${error.message}`);
        else navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) setErrorMsg(`회원가입 실패: ${error.message}`);
        else {
          setSuccessMsg('회원가입 완료! 로그인해 주세요.');
          setMode('login');
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMsg('오류 발생. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="tech-bg-canvas" />

      <div
        className="login-container"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <header className="login-header">
          <h1 className="login-title">ShareLog Tech Auth</h1>
          <p className="login-subtitle">
            {mode === 'login'
              ? '로그인하여 나만의 테크 로그를 안전하게 동기화하세요.'
              : '새로운 테크 계정을 생성하고 ShareLog의 멤버가 되어보세요.'}
          </p>
        </header>

        <form
          onSubmit={handleAuthSubmit}
          className="login-form backdrop-blur-md"
        >
          <div className="form-group">
            <label className="form-label">이메일 주소</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {errorMsg && <p className="error-message">{errorMsg}</p>}
          {successMsg && <p className="success-message">{successMsg}</p>}

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting
              ? '처리 중...'
              : mode === 'login'
                ? '로그인 인증'
                : '계정 생성'}
          </button>

          <div className="mode-toggle-text">
            {mode === 'login' ? (
              <>
                아직 계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                >
                  회원가입 하기
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                >
                  로그인 하러가기
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
