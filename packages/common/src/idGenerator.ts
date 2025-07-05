// Monotonically increasing ID generator.
let currentId = 0;

export function getNextId(): number {
  currentId++;
  return currentId;
}
