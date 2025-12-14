export function generateRandomEmail() {
  return `user-${Math.random().toString(36).slice(2,10)}@example.com`;
}