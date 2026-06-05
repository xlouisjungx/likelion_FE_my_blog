import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, content, tag, created_at')
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
    };

    fetchPosts();
  }, []);

  const tags = useMemo(() => {
    const uniqueTags = [...new Set(posts.map((post) => post.tag).filter(Boolean))];
    return ['All', ...uniqueTags];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeTag === 'All') return posts;
    return posts.filter((post) => post.tag === activeTag);
  }, [posts, activeTag]);

  const selectedPost = filteredPosts.find((post) => post.id === selectedId) ?? null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-400">게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          My Blog
        </h1>
        <p className="text-sm text-gray-400">
          Supabase에서 실시간으로 불러온 기술 블로그
        </p>
      </header>

      {tags.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setActiveTag(tag);
                setSelectedId(null);
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {tag === 'All' ? '전체' : `#${tag}`}
            </button>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-gray-400">표시할 게시글이 없습니다.</p>
          <Link
            to="/write"
            className="mt-4 inline-block text-sm text-teal-400 hover:text-teal-300"
          >
            첫 글 작성하기 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedId === post.id;

            return (
              <article
                key={post.id}
                onClick={() => setSelectedId(isSelected ? null : post.id)}
                className={`cursor-pointer rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-teal-500/40 bg-teal-500/5 shadow-lg shadow-teal-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                }`}
              >
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    {post.tag && (
                      <span className="rounded-md bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-400">
                        #{post.tag}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <h2 className="mb-2 text-lg font-semibold text-white">
                    {post.title}
                  </h2>

                  <p
                    className={`text-sm leading-relaxed text-gray-400 ${
                      isSelected ? '' : 'line-clamp-2'
                    }`}
                  >
                    {post.content}
                  </p>

                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedPost && (
        <div className="mt-6 rounded-xl border border-teal-500/30 bg-[#1a1a1a] p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-teal-400">
            상세 보기
          </p>
          <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
            {selectedPost.tag && (
              <span className="rounded-md bg-teal-500/15 px-2 py-0.5 font-medium text-teal-400">
                #{selectedPost.tag}
              </span>
            )}
            <span>{formatDate(selectedPost.created_at)}</span>
          </div>
          <h3 className="mb-3 text-xl font-bold text-white">{selectedPost.title}</h3>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
            {selectedPost.content}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
