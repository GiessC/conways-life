import { createContext } from "react";
import type { Speed, CellState, Position } from "../types";

export const LifeContext = createContext<ILifeContext>({
  dimensions: { width: 0, height: 0 },
  cellGrid: [],
  started: false,
  start: () => {},
  stop: () => {},
  resetGame: () => {},
  setSpeed: () => {},
  toggleCellAlive: () => {},
  setCellAlive: () => {},
  nextStep: () => {},
  nextStateBasedOnNeighbors: () => {
    return {
      position: { x: -1, y: -1 },
      isAlive: false,
      reason: "",
      liveNeighbors: [],
    };
  },
  cellAt: () => ({ isAlive: false, position: { x: 0, y: 0 } }),
});

export interface ILifeContext {
  cellGrid: { position: Position; isAlive: boolean }[][];
  dimensions: { width: number; height: number };
  started: boolean;
  start: () => void;
  stop: () => void;
  resetGame: () => void;
  setSpeed: (speed: Speed) => void;
  nextStep: () => void;
  nextStateBasedOnNeighbors: (
    position: Position,
    grid: CellState[][],
  ) => {
    position: Position;
    isAlive: boolean;
    reason?: string;
    liveNeighbors: CellState[];
  };
  toggleCellAlive: (position: Position) => void;
  setCellAlive: (position: Position, isAlive: boolean) => void;
  cellAt: (position: Position) => CellState;
}
