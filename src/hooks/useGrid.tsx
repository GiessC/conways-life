import { useState, useCallback } from "react";
import type { CellState, Position } from "../types";

export function useGrid(
  width: number,
  height: number,
): {
  cellGrid: CellState[][];
  setCellGrid: (
    valueOrReducer: CellState[][] | ((prev: CellState[][]) => CellState[][]),
  ) => void;
  toggleCellAlive: (position: Position) => void;
  setCellAlive: (position: Position, isAlive: boolean) => void;
  cellAt: (position: Position) => CellState;
  reset: () => void;
} {
  const [cellGrid, setCellGrid] = useState<CellState[][]>(initializeGrid);

  function initializeGrid(): CellState[][] {
    const arr: CellState[][] = [];
    for (let row = 0; row < height; row++) {
      arr.push([]);
      for (let col = 0; col < width; col++) {
        arr[row].push({ position: { x: col, y: row }, isAlive: false });
      }
    }
    return arr;
  }

  function reset(): void {
    setCellGrid(initializeGrid());
  }

  const toggleCellAlive = useCallback(
    function (position: Position): void {
      setCellGrid((prev) => {
        return prev.map((row, rowIndex) => {
          return row.map((cell, columnIndex) => {
            if (rowIndex !== position.y || columnIndex !== position.x) {
              return cell;
            }
            const newCell: CellState = { ...cell, isAlive: !cell.isAlive };
            return newCell;
          });
        });
      });
    },
    [setCellGrid],
  );

  function cellAt(position: Position): CellState {
    return cellGrid[position.y][position.x];
  }

  const setCellAlive = useCallback(
    (position: Position, isAlive: boolean): void => {
      setCellGrid((prev) => {
        return prev.map((row, rowIndex) => {
          return row.map((cell, colIndex) => {
            if (rowIndex !== position.y || colIndex !== position.x) {
              return cell;
            }
            return { ...cell, isAlive };
          });
        });
      });
    },
    [setCellGrid],
  );

  return {
    cellGrid,
    setCellGrid,
    cellAt,
    toggleCellAlive,
    setCellAlive,
    reset,
  };
}
