import type { Position } from "../types";

export class OutOfBoundsError extends Error {
  constructor(position: Position) {
    super(`Cell is out of bounds at position (${position.x}, ${position.y})`);
  }
}
