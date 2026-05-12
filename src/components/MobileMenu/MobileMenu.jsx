// components/MobileMenu/MobileMenu.jsx — 모바일 슬라이드 메뉴 (단일 책임: 모바일 내비게이션)
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ open, onClose }) {
  // 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <nav className={styles.menu} role="dialog" aria-modal="true" aria-label="모바일 메뉴">
        <button className={styles.closeBtn} onClick={onClose} aria-label="메뉴 닫기">✕</button>
        <Link to="/about" className={styles.link} onClick={onClose}>서비스 소개</Link>
        <Link to="/guide" className={styles.link} onClick={onClose}>이용 방법</Link>
      </nav>
    </>
  );
}
