/**
 * Helper 함수: 한 자리 숫자를 2자리로 포맷팅 (예: 6 -> "06")
 */
function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * YYYY.MM.DD
 */
export function formatToYMD(timestamptz) {
  const date = new Date(timestamptz);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )}`;
}

/**
 * YY.MM.DD
 */
export function formatToShortYMD(timestamptz) {
  const date = new Date(timestamptz);
  const shortYear = String(date.getFullYear()).slice(-2);
  return `${shortYear}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/**
 * YYYY.MM.DD HH:MM
 */
export function formatToYMDHM(timestamptz) {
  const date = new Date(timestamptz);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
