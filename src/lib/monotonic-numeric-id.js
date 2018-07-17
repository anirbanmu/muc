"use strict";

let currentId = 0;

export default function monotonicId() {
  currentId = currentId + 1;
  return currentId - 1;
}
