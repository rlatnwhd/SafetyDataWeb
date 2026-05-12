// components/SearchForm/SearchForm.jsx — 주소 검색 입력 폼 (단일 책임: 입력 UI)
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SearchForm.module.css';

export default function SearchForm({ onSearch, loading, disabled }) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q) => {
    if (!q.trim() || !window.kakao?.maps?.services) { setSuggestions([]); return; }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSuggestions(data.slice(0, 6));
        setOpen(true);
      } else {
        setSuggestions([]);
      }
    }, { size: 6 });
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(debounceRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280);
  };

  const handleSelect = (place) => {
    const addr = place.road_address_name || place.address_name;
    setValue(addr);
    setSuggestions([]);
    setOpen(false);
    onSearch(addr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <div ref={wrapRef} className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={disabled ? '지도 로딩 중...' : '도로명 또는 지번 주소를 입력해주세요.'}
          autoComplete="off"
          disabled={loading || disabled}
        />
        <button type="submit" className={styles.btn} disabled={loading || disabled || !value.trim()}>
          {loading ? '분석 중…' : '분석하기'}
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map((p) => (
            <li key={p.id} className={styles.item} onMouseDown={() => handleSelect(p)}>
              <span className={styles.itemName}>{p.place_name}</span>
              <span className={styles.itemAddr}>{p.road_address_name || p.address_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
