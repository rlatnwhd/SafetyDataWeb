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
            <span className={styles.logoIcon}>☁</span>
            <span>안전봄</span>
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
