/**
 * bank.dbf → public/data/banks.json 변환 스크립트
 * Node.js 내장 모듈만 사용 (외부 패키지 불필요)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DBF_PATH = path.join(__dirname, '../public/data/전국금융기관(은행)점포정보/bank.dbf');
const OUT_PATH = path.join(__dirname, '../public/data/banks.json');

const buf = fs.readFileSync(DBF_PATH);
const decoder = new TextDecoder('euc-kr');

// ── 헤더 파싱 ──────────────────────────────────────────
const numRecords  = buf.readUInt32LE(4);
const headerBytes = buf.readUInt16LE(8);
const recordBytes = buf.readUInt16LE(10);

// ── 필드 디스크립터 파싱 (32바이트씩, 0x0D 까지) ────────
const fields = [];
let offset = 32;
while (buf[offset] !== 0x0D) {
  const name = buf.slice(offset, offset + 11).toString('ascii').replace(/\0/g, '').trim();
  const type = String.fromCharCode(buf[offset + 11]);
  const length = buf[offset + 16];
  fields.push({ name, type, length });
  offset += 32;
}

// ── 레코드 파싱 ─────────────────────────────────────────
const records = [];
let recOffset = headerBytes;

for (let i = 0; i < numRecords; i++) {
  const deletionFlag = buf[recOffset];
  if (deletionFlag !== 0x2A) { // 0x2A = '*' (삭제됨)
    const record = {};
    let fieldOffset = recOffset + 1;
    for (const f of fields) {
      const raw = decoder.decode(buf.slice(fieldOffset, fieldOffset + f.length)).replace(/\0/g, '').trim();
      record[f.name] = raw;
      fieldOffset += f.length;
    }
    records.push(record);
  }
  recOffset += recordBytes;
}

// ── 필요한 필드만 추출 → JSON ──────────────────────────
const banks = records
  .filter(r => r.LAT && r.LON && parseFloat(r.LAT) && parseFloat(r.LON))
  .map((r, idx) => ({
    id:   `bank_${idx}`,
    bank: r.BANK_NM  || '',
    branch: r.BRANCH_NM || '',
    addr: r.ADDR    || '',
    lat:  parseFloat(r.LAT),
    lng:  parseFloat(r.LON),
  }));

fs.writeFileSync(OUT_PATH, JSON.stringify(banks, null, 0), 'utf-8');
console.log(`✅ 변환 완료: ${banks.length}개 은행 → ${OUT_PATH}`);
