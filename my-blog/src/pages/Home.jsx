import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/Home.css';

const MODAL_ANIMATION_MS = 520;

const Home = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [sortBy, setSortBy] = useState('latest');
  const [viewType, setViewType] = useState('rect');

  // 💡 실시간 이동 전선 회로 배경 이펙트 스크립트
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

    // 전선(라인) 객체 생성기
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
        // 기판 회로의 각도(0, 90, 180, 270도 표현)
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
        // 네온 글로우 스타일 주입
        ctx.strokeStyle = `rgba(45, 212, 191, ${line.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(45, 212, 191, 0.6)';

        // 라인 그리기
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(
          line.x - line.dirX * line.length,
          line.y - line.dirY * line.length,
        );
        ctx.stroke();

        // 좌표 이동 업데이트
        line.x += line.dirX * line.speed;
        line.y += line.dirY * line.speed;

        // 가끔씩 회로기판처럼 90도로 꺾이는 이펙트 연출
        if (Math.random() < 0.003) {
          const temp = line.dirX;
          line.dirX = line.dirY;
          line.dirY = temp;
        }

        // 화면 밖으로 이탈하면 재생성
        if (
          line.x < -150 ||
          line.x > canvas.width + 150 ||
          line.y < -150 ||
          line.y > canvas.height + 150
        ) {
          lines[index] = createLine();
        }
      });

      // 잔상 그림자 초기화 (메인 UI 렌더링 간섭 방지)
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, tag, writer, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('게시글 목록 조회 실패:', error.message);
      } else {
        setPosts(data ?? []);
      }
    } catch (err) {
      console.error('게시글 목록 조회 중 예외 발생:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback((post) => {
    setSelectedPost(post);
    setIsModalVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsModalVisible(true));
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedPost(null), MODAL_ANIMATION_MS);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!selectedPost) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPost, closeModal]);

  const processedPosts = useMemo(() => {
    const cloned = [...posts];
    if (sortBy === 'latest') {
      return cloned.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    } else if (sortBy === 'category') {
      return cloned.sort((a, b) => {
        if (!a.tag) return 1;
        if (!b.tag) return -1;
        return a.tag.localeCompare(b.tag);
      });
    }
    return cloned;
  }, [posts, sortBy]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditNavigate = (post) => {
    document.body.style.overflow = '';
    navigate('/write', { state: { post } });
  };

  const handleDeletePost = async (id) => {
    const confirmDelete = window.confirm(
      '정말로 이 게시글을 삭제하시겠습니까?',
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);

      if (error) {
        console.error('게시글 삭제 실패:', error.message);
        alert(`삭제에 실패했습니다: ${error.message}`);
      } else {
        closeModal();
        setTimeout(() => {
          fetchPosts();
        }, MODAL_ANIMATION_MS);
      }
    } catch (err) {
      console.error('게시글 삭제 중 예외 발생:', err);
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {/* 💡 데이터 로딩 여부와 관계없이 무조건 최초 구동 */}
      <canvas ref={canvasRef} className="tech-bg-canvas" />

      <div className="home-container">
        <header className="home-header">
          <h1 className="home-title">ShareLog</h1>
          <p className="home-subtitle">오늘 나의 일상을 공유해봐요. ShareLog</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <p className="text-lg text-gray-400">게시글을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    sortBy === 'latest'
                      ? 'bg-teal-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  날짜별 보기
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('category')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    sortBy === 'category'
                      ? 'bg-teal-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  카테고리별 보기
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setViewType('rect')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewType === 'rect'
                      ? 'bg-white/10 text-teal-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="리스트 스택 보기"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('square')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewType === 'square'
                      ? 'bg-white/10 text-teal-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="정사각형 그리드 보기"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2 2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {processedPosts.length === 0 ? (
              <div className="empty-state">
                <p className="text-gray-400">표시할 게시글이 없습니다.</p>
                <Link
                  to="/write"
                  className="mt-4 inline-block text-sm text-teal-400 hover:text-teal-300"
                >
                  첫 글 작성하기 →
                </Link>
              </div>
            ) : (
              <div
                className={
                  viewType === 'square'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
                    : 'posts-feed'
                }
              >
                {processedPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => openModal(post)}
                    className={`post-card backdrop-blur-md ${viewType === 'square' ? '!mb-0 aspect-square flex flex-col justify-between' : ''}`}
                  >
                    <div className="post-card-body h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center text-xs text-gray-400 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                          {post.writer && (
                            <span className="font-bold text-teal-300 mr-1.5 shrink-0">
                              {post.writer}
                            </span>
                          )}
                          {post.writer && post.tag && (
                            <span className="text-white/20 mr-1.5 shrink-0">
                              ·
                            </span>
                          )}
                          {post.tag && (
                            <span className="text-teal-400/90 font-medium mr-1.5 shrink-0">
                              #{post.tag}
                            </span>
                          )}
                          <span className="text-white/20 mr-1.5 shrink-0">
                            ·
                          </span>
                          <span className="post-date shrink-0">
                            {formatDate(post.created_at)}
                          </span>
                        </div>

                        <h2
                          className={`post-card-title ${viewType === 'square' ? 'text-base line-clamp-2' : ''}`}
                        >
                          {post.title}
                        </h2>
                      </div>

                      <p
                        className={`post-card-preview ${viewType === 'square' ? 'line-clamp-3 mt-2 text-xs flex-1' : ''}`}
                      >
                        {post.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="liquid-backdrop" data-visible={isModalVisible} />

          <div
            className="liquid-panel"
            data-visible={isModalVisible}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDeletePost(selectedPost.id)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/10 p-2.5 text-rose-400 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-300"
                aria-label="삭제"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleEditNavigate(selectedPost)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/10 p-2.5 text-teal-400 transition-all duration-200 hover:border-teal-500/40 hover:bg-teal-500/20 hover:text-teal-300"
                aria-label="수정"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="liquid-close-btn !static !top-auto !right-auto"
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-meta-row pr-32 flex items-center text-sm text-gray-400 mb-2">
              {selectedPost.writer && (
                <span className="font-bold text-teal-300 mr-1.5">
                  {selectedPost.writer}
                </span>
              )}
              {selectedPost.writer && selectedPost.tag && (
                <span className="text-white/20 mr-1.5">·</span>
              )}
              {selectedPost.tag && (
                <span className="text-teal-400/90 font-medium mr-1.5">
                  #{selectedPost.tag}
                </span>
              )}
              <span className="text-white/20 mr-1.5">·</span>
              <span className="post-date">
                {formatDate(selectedPost.created_at)}
              </span>
            </div>

            <h2 className="modal-title pr-32">{selectedPost.title}</h2>
            <p className="modal-content">{selectedPost.content}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
