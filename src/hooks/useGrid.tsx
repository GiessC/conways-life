import { useState, useCallback, useRef } from "react";
import type { CellState, Position } from "../types";
import { OutOfBoundsError } from "../errors/outOfBounds.error";

export interface IGrid {
  conditionallyUpdateAll(updateFunction: (cell: CellState) => CellState): void;
  get(position: Position): CellState;
  inBounds(position: Position): boolean;
  setAlive(position: Position, isAlive: boolean): void;
  toggleAlive(position: Position): void;
  reset(): void;
}

type CellMap = Map<number, Map<number, CellState>>;

function useCellMap(width: number, height: number) {
  const [map, setMap] = useState<CellMap>(new Map());
  const mapRef = useRef(map);
  mapRef.current = map;

  function get(position: Position): CellState {
    return (
      mapRef.current.get(position.x)?.get(position.y) ?? {
        position,
        isAlive: false,
      }
    );
  }

  function applyCell(map: CellMap, state: CellState): void {
    const { x, y } = state.position;
    if (state.isAlive) {
      if (!map.has(x)) map.set(x, new Map());
      map.get(x)!.set(y, state);
    } else {
      map.get(x)?.delete(y);
      if (map.get(x)?.size === 0) map.delete(x);
    }
  }

  function set(state: CellState): void {
    setMap((map) => {
      applyCell(map, state);
      return map;
    });
  }

  function clear(): void {
    setMap(new Map());
  }

  function updateAll(
    updateFunction: (cellState: CellState) => CellState,
  ): void {
    setMap(() => {
      const newMap: CellMap = new Map();
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const position: Position = { x, y };
          const cell = mapRef.current.get(x)?.get(y) ?? {
            position,
            isAlive: false,
          };
          const updatedCell = updateFunction(cell);
          applyCell(newMap, updatedCell);
        }
      }
      return newMap;
    });
  }

  return { get, set, clear, updateAll };
}

export function useGridV2(width: number, height: number): IGrid {
  const cellMap = useCellMap(width, height);

  function inBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < width &&
      position.y >= 0 &&
      position.y < height
    );
  }

  function get(position: Position): CellState {
    if (!inBounds(position)) {
      throw new OutOfBoundsError(position);
    }
    const cell = cellMap.get(position);
    if (!cell) {
      console.warn(`No cell found at (${position.x}, ${position.y})`);
    }
    return (
      cell ?? {
        position,
        isAlive: false,
      }
    );
  }

  return {
    get,
    inBounds,
    setAlive: function (position: Position, isAlive: boolean): void {
      cellMap.set({ position, isAlive });
    },
    toggleAlive: function (position: Position): void {
      cellMap.set({
        position,
        isAlive: !cellMap.get(position).isAlive,
      });
    },
    reset: function (): void {
      cellMap.clear();
    },
    conditionallyUpdateAll: function (
      updateFunction: (cell: CellState) => CellState,
    ): void {
      cellMap.updateAll(updateFunction);
    },
  };
}

export function useGrid(width: number, height: number): IGrid {
  const [cellGrid, setCellGrid] = useState<CellState[][]>(initializeGrid);
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

  const conditionallyUpdateAll = useCallback(
    (updateFunction: (cell: CellState) => CellState): void => {
      setCellGrid((cellGrid) => {
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
