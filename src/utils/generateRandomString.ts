/**
 * Returns random string splitted by '-'
 * like abcd-efgh-ijkl-mnop (length = 19)
 */
export function generateRandomString(str: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  const seed = str + Date.now();

  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) {
      result += '-';
    }
    const index = (seed.charCodeAt(i % seed.length) + i) % chars.length;
    result += chars[index];
  }

  return result;
}
