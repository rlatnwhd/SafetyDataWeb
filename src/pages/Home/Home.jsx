// pages/Home/Home.jsx — 메인 홈 페이지
import { useEffect } from 'react';
import SearchForm from '../../components/SearchForm/SearchForm';
import FeatureCards from '../../components/FeatureCards/FeatureCards';
import ResultSection from '../../components/ResultSection/ResultSection';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import styles from './Home.module.css';

export default function Home({ sdkReady }) {
  const { loading, error, result, search, reset } = useAddressSearch();

  useEffect(() => {
    if (result) {
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div className={styles.page}>
      {/* 히어로 */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>공공데이터 기반 자취방·안전 분석</span>
            <h1 className={styles.title}>
              이사 전에
              <br />꼭 확인하세요
              <br /><strong>우리 동네 안전 점수</strong>
            </h1>
            <p className={styles.desc}>
              CCTV·가로등·치안시설·유흥업소 데이터를 기반으로<br />
              자취방 주변 안전도와 생활 편의 점수를 분석합니다
            </p>
            <SearchForm onSearch={search} loading={loading} disabled={!sdkReady} />
            <p className={styles.hint}>※ 도로명 또는 지번 주소 모두 입력 가능합니다</p>
          </div>
          <div className={styles.heroRight}>
            <FeatureCards />
          </div>
        </div>
      </section>

      {/* 분석 결과 */}
      {(result || error) && (
        <div id="result">
          <ResultSection result={result} error={error} onClose={reset} />
        </div>
      )}
    </div>
  );
}
