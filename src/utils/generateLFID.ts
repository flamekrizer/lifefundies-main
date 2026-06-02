export function generateLFID(uid?: string): string {
  const year = new Date().getFullYear().toString().slice(-2)

  if (uid) {
    return `LF${year}${uid.substring(0, 6).toUpperCase()}`
  }

  return `LF${year}${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`
}