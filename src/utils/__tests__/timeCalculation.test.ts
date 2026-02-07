/**
 * 아가씨 시간 계산 로직 검증 테스트
 *
 * 실행: node -e "require('./src/utils/__tests__/timeCalculation.test.ts')"
 * 또는: npx ts-node src/utils/__tests__/timeCalculation.test.ts
 *
 * 아래 테스트 케이스는 요구사항에 명시된 10개 예시를 모두 포함합니다.
 */
import { calculateCount, calculateElapsedMinutes, calculateHostessCount } from '../timeCalculation';

interface TestCase {
  start: string;
  end: string;
  expectedMinutes: number;
  expectedCount: number;
  label: string;
}

const testCases: TestCase[] = [
  { start: '07:00', end: '08:00', expectedMinutes: 60, expectedCount: 1.0, label: '1시간 0분 = 1개' },
  { start: '07:00', end: '08:10', expectedMinutes: 70, expectedCount: 1.0, label: '1시간 10분 = 1개' },
  { start: '07:00', end: '08:11', expectedMinutes: 71, expectedCount: 1.5, label: '1시간 11분 = 1.5개' },
  { start: '07:00', end: '08:31', expectedMinutes: 91, expectedCount: 2.0, label: '1시간 31분 = 2개' },
  { start: '07:00', end: '09:06', expectedMinutes: 126, expectedCount: 2.2, label: '2시간 6분 = 2.2개' },
  { start: '07:00', end: '09:10', expectedMinutes: 130, expectedCount: 2.2, label: '2시간 10분 = 2.2개' },
  { start: '07:00', end: '09:11', expectedMinutes: 131, expectedCount: 2.5, label: '2시간 11분 = 2.5개' },
  { start: '07:00', end: '09:31', expectedMinutes: 151, expectedCount: 3.0, label: '2시간 31분 = 3개' },
  { start: '07:00', end: '10:06', expectedMinutes: 186, expectedCount: 3.2, label: '3시간 6분 = 3.2개' },
  { start: '07:00', end: '10:31', expectedMinutes: 211, expectedCount: 4.0, label: '3시간 31분 = 4개' },
];

// 자정 넘김 테스트
const midnightTestCases: TestCase[] = [
  { start: '23:50', end: '01:10', expectedMinutes: 80, expectedCount: 1.0, label: '자정넘김: 23:50~01:10 = 80분 = 1개' },
  { start: '23:00', end: '01:11', expectedMinutes: 131, expectedCount: 2.5, label: '자정넘김: 23:00~01:11 = 131분 = 2.5개' },
];

// 단기 방문 테스트
const shortTestCases: TestCase[] = [
  { start: '19:00', end: '19:05', expectedMinutes: 5, expectedCount: 1.0, label: '5분 = 1개' },
  { start: '19:00', end: '19:20', expectedMinutes: 20, expectedCount: 1.5, label: '20분 = 1.5개' },
  { start: '19:00', end: '19:45', expectedMinutes: 45, expectedCount: 2.0, label: '45분 = 2개' },
];

function runTests() {
  let passed = 0;
  let failed = 0;
  const allTests = [...testCases, ...midnightTestCases, ...shortTestCases];

  console.log('=== 아가씨 시간 계산 테스트 ===\n');

  for (const tc of allTests) {
    const minutes = calculateElapsedMinutes(tc.start, tc.end);
    const count = calculateCount(minutes);
    const minutesOk = minutes === tc.expectedMinutes;
    const countOk = Math.abs(count - tc.expectedCount) < 0.001;

    if (minutesOk && countOk) {
      console.log(`✅ ${tc.label}`);
      passed++;
    } else {
      console.log(`❌ ${tc.label}`);
      if (!minutesOk) console.log(`   경과시간: 예상 ${tc.expectedMinutes}분, 실제 ${minutes}분`);
      if (!countOk) console.log(`   개수: 예상 ${tc.expectedCount}개, 실제 ${count}개`);
      failed++;
    }
  }

  console.log(`\n=== 결과: ${passed}개 통과, ${failed}개 실패 (총 ${allTests.length}개) ===`);
  return failed === 0;
}

// Export for potential jest usage
export { runTests, testCases };

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}
