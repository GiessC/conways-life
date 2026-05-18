import { useCallback } from "react";
import type { Position } from "../types";
import { useLifeContext } from "./useLifeContext";
import { OutOfBoundsError } from "../errors/outOfBounds.error";

export function useCell(position: Position) {
  const { cellAt, toggleCellAlive } = useLifeContext();

  const isAlive = cellAt(position).isAlive;

  const getNeighbors = useCallback(() => {
    const neighborsMatrix = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];
    const neighbors = [];
    for (const [neighborXOffset, neighborYOffset] of neighborsMatrix) {
      try {
        const cell = cellAt({
          x: position.x + neighborXOffset,
          y: position.y + neighborYOffset,
        });
        neighbors.push(cell);
      } catch (error: unknown) {
        if (error instanceof OutOfBoundsError) {
          continue;
        }
        throw error;
      }
    }
    return neighbors;
  }, [cellAt, position.x, position.y]);

  return {
    isAlive,
    toggleAlive: () => toggleCellAlive(position),
    getNeighbors,
  };
}
