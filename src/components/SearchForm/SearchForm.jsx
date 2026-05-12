// components/SearchForm/SearchForm.jsx — 주소 검색 입력 폼 (단일 책임: 입력 UI)
import { useState } from 'react';
import styles from './SearchForm.module.css';

export default function SearchForm({ onSearch, loading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="예: 부산시 사상구 괘법동 374"
        autoComplete="off"
        disabled={loading}
      />
      <button type="submit" className={styles.btn} disabled={loading || !value.trim()}>
        {loading ? '분석 중…' : '분석하기'}
      </button>
    </form>
  );
}
