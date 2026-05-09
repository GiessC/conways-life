import type { Position } from "../types";
import { useLifeContext } from "./useLifeContext";

export function useCell(position: Position) {
  const { cellAt, toggleCellAlive } = useLifeContext();

  const isAlive = cellAt(position).isAlive;

  return {
    isAlive,
    toggleAlive: () => toggleCellAlive(position),
  };
}
