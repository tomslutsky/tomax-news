export function trancate(str: string, length: number) {
  return `${str.slice(0, length)}${str.length > length ? "..." : ""}`;
}
