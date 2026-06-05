import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const WriteBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !content.trim()) {
      setErrorMsg('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('posts').insert({
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
    } catch (err) {
      console.error('게시글 저장 중 예외 발생:', err);
      setErrorMsg('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <Link
          to="/"
          className="mb-4 inline-flex items-center text-sm text-gray-400 transition-colors hover:text-teal-400"
        >
          ← 목록으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-white">새 글 작성</h1>
        <p className="mt-1 text-sm text-gray-400">
          작성한 글은 Supabase posts 테이블에 저장됩니다.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-300">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-gray-300">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게시글 내용을 입력하세요"
            rows={10}
            className="w-full resize-y rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        <div>
          <label htmlFor="tag" className="mb-1.5 block text-sm font-medium text-gray-300">
            태그 <span className="text-gray-500">(선택)</span>
          </label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="예: React, Supabase"
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        {errorMsg && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? '저장 중...' : '게시글 발행'}
        </button>
      </form>
    </div>
  );
};

export default WriteBlog;
