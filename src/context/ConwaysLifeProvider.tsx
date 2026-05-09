import { type PropsWithChildren, useCallback, useRef, useState } from "react";
import { useGrid } from "../hooks/useGrid";
import { Speed, type CellState, type Position } from "../types";
import { LifeContext } from "./LifeContext";

export function ConwaysLifeProvider({
  width,
  height,
  children,
}: PropsWithChildren<{
  width: number;
  height: number;
}>) {
  const {
    cellGrid,
    setCellGrid,
    cellAt,
    setCellAlive,
    toggleCellAlive,
    reset,
  } = useGrid(width, height);
  const [started, setStarted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<Speed>(Speed.normal());
  const timer = useRef<number | undefined>(undefined);

  const visualizedRelevantCells = useCallback(
    (relevantCellsOnlyGrid: CellState[]) => {
      const fakeGrid: (CellState | undefined)[][] = new Array(cellGrid.length);
      for (let row = 0; row < cellGrid.length; row++) {
        fakeGrid[row] = new Array(cellGrid[row].length);
        for (let col = 0; col < cellGrid[row].length; col++) {
          const relevantCellMaybe = relevantCellsOnlyGrid.find(
            (cell) => cell.position.x === col && cell.position.y === row,
          );
          fakeGrid[row][col] = relevantCellMaybe;
        }
      }
      return visualizedGrid(fakeGrid);
    },
    [cellGrid],
  );

  function visualizedGrid(grid: (CellState | undefined)[][]): string {
    return grid
      .map((cellRow) => {
        return cellRow
          .map((cell) => {
            if (!cell) {
              return -1;
            }
            return cell.isAlive ? 1 : 0;
          })
          .join(" ");
      })
      .join("\n");
  }

  const visualizedNeighbors = useCallback(
    (position: Position, neighbors: CellState[]) => {
      const matrix = new Array(3);
      for (let row = 0; row < 3; row++) {
        matrix[row] = new Array(3).fill(-1);
      }
      for (const neighbor of neighbors) {
        matrix[neighbor.position.y - position.y + 1][
          neighbor.position.x - position.x + 1
        ] = neighbor.isAlive ? 1 : 0;
      }
      return visualizedGrid(matrix);
    },
    [],
  );

  const isInBounds = useCallback(
    (newXOrY: number, axis: "x" | "y"): boolean => {
      return newXOrY >= 0 && newXOrY < (axis === "x" ? width : height);
    },
    [height, width],
  );

  const getNeighbors = useCallback(
    (position: Position, grid: CellState[][]): CellState[] => {
      const MATRIX: number[][] = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ];

      const neighborsMatrix: CellState[] = [];
      for (const [colDiff, rowDiff] of MATRIX) {
        const newY = position.y + rowDiff;
        const newX = position.x + colDiff;
        if (!isInBounds(newY, "y")) {
          continue;
        }
        if (!isInBounds(newX, "x")) {
          continue;
        }
        neighborsMatrix.push(grid[position.y + rowDiff][position.x + colDiff]);
      }
      return neighborsMatrix;
    },
    [isInBounds],
  );

  const getLiveNeighbors = useCallback(
    (position: Position, grid: CellState[][]): CellState[] => {
      return getNeighbors(position, grid).filter(
        (neighbor) => neighbor?.isAlive ?? false,
      );
    },
    [getNeighbors],
  );

  const nextStateBasedOnNeighbors = useCallback(
    (
      position: Position,
      grid: CellState[][],
    ): {
      position: Position;
      isAlive: boolean;
      reason?: string;
      liveNeighbors: CellState[];
    } => {
      const cell = grid[position.y][position.x];
      const liveNeighbors = getLiveNeighbors(position, grid);
      console.debug(
        "next state. neighbors:",
        visualizedNeighbors(position, liveNeighbors),
      );
      if (!cell.isAlive && liveNeighbors.length === 3) {
        return {
          position: cell.position,
          isAlive: true,
          reason: "reproduction",
          liveNeighbors,
        };
      }
      if (cell.isAlive && liveNeighbors.length > 3) {
        return {
          position: cell.position,
          isAlive: false,
          reason: "overpopulation",
          liveNeighbors,
        };
      }
      if (cell.isAlive && liveNeighbors.length < 2) {
        return {
          position: cell.position,
          isAlive: false,
          reason: "underpopulation",
          liveNeighbors,
        };
      }
      if (cell.isAlive) {
        return {
          position: cell.position,
          isAlive: true,
          reason: "sustainable",
          liveNeighbors,
        };
      }
      return {
        position: cell.position,
        isAlive: cell.isAlive,
        liveNeighbors,
      };
    },
    [getLiveNeighbors, visualizedNeighbors],
  );

  const atLeastOneNeighborIsAlive = useCallback(
    (position: Position, grid: CellState[][]) => {
      const neighbors = getLiveNeighbors(position, grid);
      console.debug(
        `live neighbors\n${visualizedNeighbors(position, neighbors)}`,
      );
      return neighbors.length > 0;
    },
    [getLiveNeighbors, visualizedNeighbors],
  );

  const relevantCellsOnly = useCallback(
    (grid: CellState[][]): CellState[] => {
      const relevantCellsOnlyGrid: CellState[] = [];
      const clonedGrid = grid.map((row) => row.slice());
      for (const row of clonedGrid) {
        for (const cell of row) {
          if (
            !cell.isAlive &&
            !atLeastOneNeighborIsAlive(cell.position, grid)
          ) {
            continue;
          }
          relevantCellsOnlyGrid.push(cell);
        }
      }
      return relevantCellsOnlyGrid;
    },
    [atLeastOneNeighborIsAlive],
  );

  const nextStep = useCallback((): void => {
    setCellGrid((prev: CellState[][]) => {
      const newCellGrid: CellState[][] = prev.map((arr) => arr.slice());
      const relevantCellsOnlyGrid = relevantCellsOnly(prev);
      console.debug(
        "relevant\n",
        visualizedRelevantCells(relevantCellsOnlyGrid),
      );
      for (const relevantCell of relevantCellsOnlyGrid) {
        const nextState = nextStateBasedOnNeighbors(
          relevantCell.position,
          prev,
        );
        console.debug("next state", JSON.stringify(nextState));
        newCellGrid[relevantCell.position.y][relevantCell.position.x] = {
          ...newCellGrid[relevantCell.position.y][relevantCell.position.x],
          isAlive: nextState.isAlive,
        };
      }
      return newCellGrid;
    });
  }, [
    nextStateBasedOnNeighbors,
    relevantCellsOnly,
    setCellGrid,
    visualizedRelevantCells,
  ]);

  const start = useCallback(() => {
    setStarted(true);
    timer.current = setInterval(() => {
      nextStep();
    }, speed.toSeconds() * 1_000);
  }, [nextStep, speed, timer]);

  const stop = useCallback(() => {
    setStarted(false);
    clearInterval(timer.current);
    timer.current = undefined;
  }, [timer]);

  function resetGame() {
    reset();
  }

  return (
    <LifeContext
      value={{
        dimensions: { width, height },
        cellGrid,
        started,
        start,
        stop,
        resetGame,
        setSpeed: (speedOrReducer: Speed | ((prev: Speed) => Speed)) => {
          setSpeed((prev) => {
            const value =
              typeof speedOrReducer === "function"
                ? speedOrReducer(prev)
                : speedOrReducer;
            if (timer.current) {
              clearInterval(timer.current);
              timer.current = setInterval(nextStep, value.toSeconds() * 1_000);
            }
            return value;
          });
        },
        nextStep,
        nextStateBasedOnNeighbors,
        toggleCellAlive,
        setCellAlive,
        cellAt,
      }}
    >
      {children}
    </LifeContext>
  );
}
