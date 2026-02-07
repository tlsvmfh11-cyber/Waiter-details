/**
 * 숫자를 원화 형식으로 포맷 (₩1,234,000)
 */
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * 숫자를 천 단위 콤마로 포맷 (1,234,000)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 숫자 문자열에서 콤마 제거 후 숫자 변환
 */
export function parseAmount(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
