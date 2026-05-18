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
  const grid = useGrid(width, height);
  const { inBounds, get, conditionallyUpdateAll, reset } = grid;
  const [started, setStarted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<Speed>(Speed.normal());
  const timer = useRef<number | undefined>(undefined);

  const getNeighbors = useCallback(
    (position: Position): CellState[] => {
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
        if (!inBounds({ x: newX, y: newY })) {
          continue;
        }
        const neighborCell = get({
          x: position.x + colDiff,
          y: position.y + rowDiff,
        });
        if (neighborCell) {
          neighborsMatrix.push(neighborCell);
        }
      }
      return neighborsMatrix;
    },
    [get, inBounds],
  );

  const getLiveNeighbors = useCallback(
    (position: Position): CellState[] => {
      return getNeighbors(position).filter(
        (neighbor) => neighbor?.isAlive ?? false,
      );
    },
    [getNeighbors],
  );

  const nextStateBasedOnNeighbors = useCallback(
    (
      position: Position,
    ): {
      position: Position;
      isAlive: boolean;
      reason?: string;
      liveNeighbors: CellState[];
    } => {
      const cell = get(position);
      const liveNeighbors = getLiveNeighbors(position);
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
    [get, getLiveNeighbors],
  );

  const nextStep = useCallback((): void => {
    console.log("next step");
    conditionallyUpdateAll((cell: CellState): CellState => {
      console.log("update");
      const nextState = nextStateBasedOnNeighbors(cell.position);
      if (nextState.isAlive == cell.isAlive) {
        return cell;
      }
      console.log(cell.position, {
        current: cell.isAlive,
        next: nextState.isAlive,
      });
      console.log("new cell", { ...cell, ...nextState });
      return { ...cell, ...nextState };
    });
  }, [conditionallyUpdateAll, nextStateBasedOnNeighbors]);

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
        ...grid,
        toggleCellAlive: grid.toggleAlive,
        cellAt: grid.get,
        setCellAlive: grid.setAlive,
        dimensions: { width, height },
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
      }}
    >
      {children}
    </LifeContext>
  );
}
