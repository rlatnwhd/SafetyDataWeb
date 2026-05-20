// components/Header/Header.jsx — 헤더 (단일 책임: 네비게이션 렌더링)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from '../MobileMenu/MobileMenu';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>안전한가봄</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/about" className={styles.navLink}>서비스 소개</Link>
            <Link to="/guide" className={styles.navLink}>이용 방법</Link>
            <button
              className={styles.menuBtn}
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
            >
              &#8942;
            </button>
          </nav>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
