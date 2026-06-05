import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/WriteBlog.css';

const WriteBlog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);

  const editPost = location.state?.post || null;
  const isEditMode = !!editPost;

  const [writer, setWriter] = useState(editPost ? editPost.writer || '' : '');
  const [title, setTitle] = useState(editPost ? editPost.title : '');
  const [content, setContent] = useState(editPost ? editPost.content : '');
  const [tag, setTag] = useState(editPost ? editPost.tag || '' : '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 💡 글쓰기 페이지 내에도 동일 콘셉트 배경 일관 적용
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !content.trim()) {
      setErrorMsg('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('posts')
          .update({
            writer: writer.trim() || null,
            title: title.trim(),
            content: content.trim(),
            tag: tag.trim() || null,
          })
          .eq('id', editPost.id);

        if (error) {
          console.error('게시글 수정 실패:', error.message);
          setErrorMsg(`수정에 실패했습니다: ${error.message}`);
        } else {
          navigate('/');
        }
      } else {
        const { error } = await supabase.from('posts').insert({
          writer: writer.trim() || null,
          title: title.trim(),
          content: content.trim(),
          tag: tag.trim() || null,
        });

        if (error) {
          console.error('게시글 저장 실패:', error.message);
          setErrorMsg(`저장에 실패했습니다: ${error.message}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('게시글 처리 중 예외 발생:', err);
      setErrorMsg('처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 💡 글쓰기 전용 백그라운드 캔버스 배치 */}
      <canvas ref={canvasRef} className="tech-bg-canvas" />

      <div className="write-container">
        <header className="write-header">
          <Link to="/" className="back-link">
            ← 목록으로 돌아가기
          </Link>
          <h1 className="write-title">
            {isEditMode ? '게시글 수정' : '새 글 작성'}
          </h1>
          <p className="write-subtitle">
            {isEditMode
              ? '수정된 내용은 데이터베이스에 실시간 업데이트됩니다.'
              : '작성한 글은 Supabase posts 테이블에 저장됩니다.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="write-form backdrop-blur-md">
          <div>
            <label htmlFor="writer" className="form-label">
              작성자 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              id="writer"
              type="text"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
              placeholder="이름 혹은 닉네임을 입력하세요"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="title" className="form-label">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="content" className="form-label">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="게시글 내용을 입력하세요"
              rows={10}
              className="form-input form-textarea"
            />
          </div>

          <div>
            <label htmlFor="tag" className="form-label">
              태그 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              id="tag"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="ex) 일상, 개발, 여행 ..."
              className="form-input"
            />
          </div>

          {errorMsg && <p className="error-message">{errorMsg}</p>}

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting
              ? '저장 중...'
              : isEditMode
                ? '수정 완료'
                : '게시글 발행'}
          </button>
        </form>
      </div>
    </>
  );
};

export default WriteBlog;
