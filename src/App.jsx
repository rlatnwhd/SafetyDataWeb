// App.jsx — 라우터 설정 (단일 책임: 경로-페이지 매핑)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKakaoSdk } from './hooks/useKakaoSdk';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Guide from './pages/Guide/Guide';

export default function App() {
  const { ready, error } = useKakaoSdk();

  return (
    <BrowserRouter>
      {error && (
        <div style={{
          background: '#fef2f2', color: '#b91c1c',
          padding: '0.6rem 1.25rem', fontSize: '0.85rem', textAlign: 'center'
        }}>
          ⚠ {error}
        </div>
      )}
      <Header />
      <Routes>
        <Route path="/" element={<Home sdkReady={ready} />} />
        <Route path="/about" element={<About />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
