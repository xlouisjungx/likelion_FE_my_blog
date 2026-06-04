import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts') // 1. posts 테이블에서
        .select('*') // 2. 모든 Column을
        .order('created_at', { ascending: false }); // 3. 생성시간 기준 내림차순으로 가져오기

      if (error) {
        console.error('데이터 로딩 에러:', error.message);
      } else {
        setPosts(data); // 성공적으로 가져온 JSON 배열을 상태에 저장
      }
      setLoading(false);
    }

    fetchPosts();
  }, []); // 이제 이건 뭔뜻인지 알겠지?

  // 데이터를 가져오는 동안 보여줄 로딩 화면
  if (loading)
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px' }}>
        클라우드 데이터 로딩 중...
      </div>
    );

  return (
    <div
      style={{
        padding: '30px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#2d3748' }}>
        포트폴리오 블로그
      </h1>
      <p style={{ textAlign: 'center', color: '#718096' }}>
        Supabase DB에서 실시간으로 가져온 글 목록
      </p>
      <hr style={{ border: '0.5px solid #e2e8f0', margin: '20px 0' }} />

      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#a0aec0' }}>
          Supabase 대시보드에서 posts 테이블에 첫 글을 추가해 보세요!
        </p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: '1px solid #e2e8f0',
              padding: '20px',
              marginBottom: '15px',
              borderRadius: '10px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 style={{ margin: '0 0 10px 0', color: '#1a202c' }}>
              {post.title}
            </h2>
            <p style={{ color: '#4a5568', lineHeight: '1.6' }}>
              {post.content}
            </p>
            <span
              style={{
                background: '#edf2f7',
                color: '#4a5568',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              #{post.tag}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
