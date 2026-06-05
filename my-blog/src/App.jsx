import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import WriteBlog from './pages/WriteBlog';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#121212]">
        <nav className="border-b border-white/10 bg-[#121212]/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link
              to="/"
              className="text-lg font-bold tracking-tight text-white transition-colors hover:text-teal-400"
            >
              My Blog
            </Link>
            <Link
              to="/write"
              className="rounded-lg bg-teal-600/20 px-4 py-1.5 text-sm font-medium text-teal-400 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-600/30"
            >
              글쓰기
            </Link>
          </div>
        </nav>

        <main>
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
