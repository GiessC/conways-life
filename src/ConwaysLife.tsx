import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export function ConwaysLife() {
  return (
    <ConwaysLifeProvider width={40} height={60}>
      <div>
        <Grid />
        <Actions />
      </div>
    </ConwaysLifeProvider>
  );
}

const ConwaysLifeContext = createContext<LifeContext>({
  dimensions: { width: 0, height: 0 },
  cellGrid: [],
  started: false,
  toggleStart: () => {},
  toggleCellAlive: () => {},
  setCellAlive: () => {},
  nextStep: () => {},
  nextStateBasedOnNeighbors: () => {
    return { isAlive: false, reason: "" };
  },
  cellAt: () => ({ isAlive: false, position: { x: 0, y: 0 } }),
});

interface LifeContext {
  cellGrid: { position: Position; isAlive: boolean }[][];
  dimensions: { width: number; height: number };
  started: boolean;
  toggleStart: () => void;
  nextStep: () => void;
  nextStateBasedOnNeighbors: (position: Position) => {
    isAlive: boolean;
    reason: string;
  };
  toggleCellAlive: (position: Position) => void;
  setCellAlive: (position: Position, isAlive: boolean) => void;
  cellAt: (position: Position) => CellState;
}

interface CellState {
  position: Position;
  isAlive: boolean;
}

function ConwaysLifeProvider({
  width,
  height,
  children,
}: PropsWithChildren<{
  width: number;
  height: number;
}>) {
  const { cellGrid, setCellGrid, cellAt, setCellAlive, toggleCellAlive } =
    useGrid(width, height);
  const [started, setStarted] = useState<boolean>(false);

  function nextStep(): void {
    setCellGrid((prev: CellState[][]) => {
      const relevantCellsOnlyGrid: CellState[][] = cellGrid.filter(
        (cellRow) => {
          return cellRow.filter((cell) => {
            return cell.isAlive || atLeastOneNeighborIsAlive(cell.position);
          });
        },
      );
      const newCellGrid: CellState[][] = [...prev];
      for (const cellRow of relevantCellsOnlyGrid) {
        for (const cell of cellRow) {
          const state = nextStateBasedOnNeighbors(cell.position);
          console.debug(cell.position, state);
          cell.isAlive = state.isAlive;
        }
      }
      return newCellGrid;
    });
  }

  function atLeastOneNeighborIsAlive(position: Position) {
    const neighbors = getNeighbors(position);
    for (const neighbor of neighbors) {
      if (neighbor.isAlive) {
        return true;
      }
    }
    return false;
  }

  function nextStateBasedOnNeighbors(position: Position) {
    const cell = cellAt(position);
    const neighbors = getNeighbors(position);
    if (!cell.isAlive && threeAreAlive(neighbors)) {
      return { isAlive: true, reason: "reproduction" };
    }
    if (moreThanThreeAreAlive(neighbors)) {
      return { isAlive: false, reason: "overpopulation" };
    }
    if (lessThanTwoAreAlive(neighbors)) {
      return { isAlive: false, reason: "underpopulation" };
    }
    return { isAlive: true, reason: "sustainable" };
  }

  function aliveCount(neighbors: CellState[]): number {
    let count = 0;
    for (const neighbor of neighbors) {
      if (!neighbor?.isAlive) {
        continue;
      }
      count += 1;
    }
    return count;
  }

  function threeAreAlive(neighbors: CellState[]): boolean {
    return aliveCount(neighbors) === 3;
  }
  function moreThanThreeAreAlive(neighbors: CellState[]): boolean {
    return aliveCount(neighbors) > 3;
  }
  function lessThanTwoAreAlive(neighbors: CellState[]): boolean {
    return aliveCount(neighbors) < 2;
  }

  function getNeighbors(position: Position): CellState[] {
    const neighborsMatrix: number[][] = [
      [-1, 1],
      [0, 1],
      [1, 1],
      [-1, 0],
      [1, 1],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];

    return neighborsMatrix
      .map(([neighborColDiff, neighborRowDiff]) => {
        const newY = position.y + neighborRowDiff;
        const newX = position.x + neighborColDiff;
        if (!isInBounds(newY, "y") || !isInBounds(newX, "x")) {
          return undefined;
        }
        if (!cellGrid[newY]) {
          console.warn({ newX, newY });
          return;
        }
        return cellGrid[newY][newX];
      })
      .filter((matrixCell) => {
        return !!matrixCell;
      });
  }

  function isInBounds(newXOrY: number, axis: "x" | "y"): boolean {
    return newXOrY >= 0 && newXOrY <= (axis === "x" ? width : height);
  }

  return (
    <ConwaysLifeContext
      value={{
        dimensions: { width, height },
        cellGrid,
        started,
        toggleStart: () => setStarted((prev) => !prev),
        nextStep,
        nextStateBasedOnNeighbors,
        toggleCellAlive,
        setCellAlive,
        cellAt,
      }}
    >
      {children}
    </ConwaysLifeContext>
  );
}

interface Position {
  x: number;
  y: number;
}

function useLifeContext() {
  return useContext<LifeContext>(ConwaysLifeContext);
}

function Actions() {
  const { nextStep } = useLifeContext();

  return (
    <div className="flex mt-2">
      <button className="bg-black border p-2" onClick={nextStep}>
        Next
      </button>
    </div>
  );
}

const CELL_SIZE_PX = 24;
function Grid() {
  const { dimensions, cellGrid } = useLifeContext();

  return (
    <div
      style={{
        width: dimensions.width * CELL_SIZE_PX,
        height: dimensions.height * CELL_SIZE_PX,
      }}
    >
      {cellGrid.map((cellRow) => {
        return (
          <div className="flex">
            {cellRow.map((props) => (
              <Cell {...props} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function useGrid(
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

function useCell(position: Position) {
  const { cellAt, toggleCellAlive } = useLifeContext();

  const isAlive = cellAt(position).isAlive;

  return {
    isAlive,
    toggleAlive: () => toggleCellAlive(position),
  };
}

function Cell({ position }: { position: Position }) {
  const { isAlive, toggleAlive } = useCell(position);

  const colors: Record<string, string> = {
    true: "black",
    false: "white",
  };

  return (
    <div
      onClick={() => toggleAlive()}
      style={{
        width: CELL_SIZE_PX,
        height: CELL_SIZE_PX,
        borderWidth: "1px",
        backgroundColor: colors[String(isAlive)],
      }}
    />
  );
}
