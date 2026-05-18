import { useState, useCallback, useRef } from "react";
import type { CellState, Position } from "../types";
import { OutOfBoundsError } from "../errors/outOfBounds.error";

export interface IGrid {
  // batchUpdate(updates: { items: CellState[] }): void;
  conditionallyUpdateAll(updateFunction: (cell: CellState) => CellState): void;
  get(position: Position): CellState;
  inBounds(position: Position): boolean;
  setAlive(position: Position, isAlive: boolean): void;
  toggleAlive(position: Position): void;
  reset(): void;
}

// map: Map<number, Map<number, CellState>>; (subset of our total cells)
//
// get(...) spans all of our cells
// as in, if i call get({ x: 180, y: 53216 }), a dead cell, in dead space with no live neighbors, it should return a valid CellState

// export function useGridV2(width: number, height: number) {}

export function useGrid(width: number, height: number): IGrid {
  const [cellGrid, setCellGrid] = useState<CellState[][]>(initializeGrid);
  // Always points to the latest cellGrid so stale closures (e.g. setInterval callbacks)
  // still read current state instead of the snapshot from when they were created.
  const cellGridRef = useRef(cellGrid);
  cellGridRef.current = cellGrid;

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
    if (!inBounds(position)) {
      throw new OutOfBoundsError(position);
    }
    return cellGridRef.current[position.y][position.x];
  }

  function inBounds(position: Position): boolean {
    return (
      position.y >= 0 &&
      position.y < cellGrid.length &&
      position.x >= 0 &&
      position.x < cellGrid[0].length
    );
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

  function cloneGrid(grid: CellState[][]) {
    return grid.map((gridRow) => gridRow.slice());
  }

  function everybodyIsDead(grid: CellState[][]): boolean {
    return !grid.flatMap((gridRow) => gridRow).some((cell) => cell.isAlive);
  }

  const conditionallyUpdateAll = useCallback(
    (updateFunction: (cell: CellState) => CellState): void => {
      setCellGrid((cellGrid) => {
        if (everybodyIsDead(cellGrid)) {
          return cellGrid;
        }
        const newGrid = cloneGrid(cellGrid);
        for (const cellRow of newGrid) {
          for (const cell of cellRow) {
            const newCell = updateFunction(cell);
            newGrid[newCell.position.y][newCell.position.x] = newCell;
          }
        }
        return newGrid;
      });
    },
    [],
  );

  return {
    get: cellAt,
    inBounds,
    toggleAlive: toggleCellAlive,
    setAlive: setCellAlive,
    conditionallyUpdateAll,
    reset,
  };
}
