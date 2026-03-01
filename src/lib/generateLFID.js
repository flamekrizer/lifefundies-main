export function generateLFID() {
  const randomLetters = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `LF-${randomNumber}${randomLetters}`;
}