// components/Footer/Footer.jsx — 데이터 저작권 표시
import styles from './Footer.module.css';

const SOURCES = [
  {
    label: 'CCTV 설치 현황',
    provider: '공공데이터포털 (data.go.kr)',
    note: '공공누리 제1유형 — 출처 표시',
    url: 'https://www.data.go.kr',
  },
  {
    label: '범죄 발생 지역별 통계',
    provider: '경찰청 (police.go.kr)',
    note: '공공누리 제1유형 — 출처 표시',
    url: 'https://www.police.go.kr',
  },
  {
    label: '전국 금융기관(은행) 점포 정보',
    provider: '전국은행연합회 소비자포털 (consumer.fss.or.kr)',
    note: '비상업적 목적 공개·배포 — 원 출처 명시 필요. 저작권: 전국은행연합회 및 개별 참여 은행',
    url: 'https://consumer.fss.or.kr',
  },
  {
    label: '편의점·병원·유흥업소·대형마트 위치',
    provider: '카카오 로컬 API (kakao.com)',
    note: '카카오 오픈 API 이용 약관 준수',
    url: 'https://developers.kakao.com',
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.heading}>데이터 출처 및 저작권</p>
        <ul className={styles.list}>
          {SOURCES.map((s) => (
            <li key={s.label} className={styles.item}>
              <span className={styles.dataLabel}>{s.label}</span>
              <span className={styles.sep}>·</span>
              <a
                className={styles.provider}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.provider}
              </a>
              <span className={styles.note}>{s.note}</span>
            </li>
          ))}
        </ul>
        <p className={styles.copy}>
          본 서비스는 공공데이터 및 오픈 API를 활용한 비상업적 학습 목적의 2차 저작물입니다.
        </p>
      </div>
    </footer>
  );
}
