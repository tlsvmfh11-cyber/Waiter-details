/**
 * 시간 계산 로직 검증 스크립트 (순수 JS - Node.js에서 바로 실행 가능)
 *
 * 실행: node test-calc.js
 *
 * [규칙 요약]
 * - 60분 미만: 0~10분→1개, 11~30분→1.5개, 31~59분→2개
 * - 60분 이상: 매 60분=1개, 추가 0~5분→+0, 6~10분→+0.2, 11~30분→+0.5, 31~60분→+1
 */

function calculateCount(totalMinutes) {
  if (totalMinutes <= 0) return 0;

  // 첫 1시간 미만 (0~59분)
  if (totalMinutes < 60) {
    if (totalMinutes <= 10) return 1;
    if (totalMinutes <= 30) return 1.5;
    return 2;
  }

  // 60분 이상: 모든 추가 시간 동일 규칙
  const fullHours = Math.floor(totalMinutes / 60);
  const extraMinutes = totalMinutes % 60;

  const base = fullHours;
  if (extraMinutes <= 5) return base;
  if (extraMinutes <= 10) return base + 0.2;
  if (extraMinutes <= 30) return base + 0.5;
  return base + 1;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calcElapsed(start, end) {
  let s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (e <= s) e += 24 * 60;
  return e - s;
}

const tests = [
  // 60분 이상 — 통일된 규칙 (+0.2 첫 추가시간부터 적용)
  ['07:00', '08:00', 60, 1.0, '1시간 0분 = 1개'],
  ['07:00', '08:05', 65, 1.0, '1시간 5분 = 1개 (+5분→+0)'],
  ['07:00', '08:06', 66, 1.2, '1시간 6분 = 1.2개 (+6분→+0.2)'],
  ['07:00', '08:10', 70, 1.2, '1시간 10분 = 1.2개 (+10분→+0.2)'],
  ['07:00', '08:11', 71, 1.5, '1시간 11분 = 1.5개 (+11분→+0.5)'],
  ['07:00', '08:30', 90, 1.5, '1시간 30분 = 1.5개 (+30분→+0.5)'],
  ['07:00', '08:31', 91, 2.0, '1시간 31분 = 2개 (+31분→+1)'],
  ['07:00', '09:00', 120, 2.0, '2시간 0분 = 2개'],
  ['07:00', '09:06', 126, 2.2, '2시간 6분 = 2.2개'],
  ['07:00', '09:10', 130, 2.2, '2시간 10분 = 2.2개'],
  ['07:00', '09:11', 131, 2.5, '2시간 11분 = 2.5개'],
  ['07:00', '09:31', 151, 3.0, '2시간 31분 = 3개'],
  ['07:00', '10:06', 186, 3.2, '3시간 6분 = 3.2개'],
  ['07:00', '10:31', 211, 4.0, '3시간 31분 = 4개'],
  // 자정 넘김
  ['23:00', '00:06', 66, 1.2, '자정넘김: 23:00~00:06 = 66분 = 1.2개'],
  ['23:00', '01:11', 131, 2.5, '자정넘김: 23:00~01:11 = 131분 = 2.5개'],
  // 단기 방문 (60분 미만)
  ['19:00', '19:05', 5, 1.0, '5분 = 1개'],
  ['19:00', '19:20', 20, 1.5, '20분 = 1.5개'],
  ['19:00', '19:45', 45, 2.0, '45분 = 2개'],
];

console.log('=== 아가씨 시간 계산 테스트 ===\n');

let passed = 0;
let failed = 0;

for (const [start, end, expectedMin, expectedCount, label] of tests) {
  const min = calcElapsed(start, end);
  const count = calculateCount(min);
  const minOk = min === expectedMin;
  const countOk = Math.abs(count - expectedCount) < 0.001;

  if (minOk && countOk) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    if (!minOk) console.log(`     경과시간: 예상 ${expectedMin}분, 실제 ${min}분`);
    if (!countOk) console.log(`     개수: 예상 ${expectedCount}개, 실제 ${count}개`);
    failed++;
  }
}

console.log(`\n=== 결과: ${passed}개 통과, ${failed}개 실패 (총 ${tests.length}개) ===`);
process.exit(failed === 0 ? 0 : 1);
