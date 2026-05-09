import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

export function ConwaysLife() {
  return (
    <ConwaysLifeProvider width={5} height={5}>
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
      const newCellGrid: CellState[][] = prev.map((arr) => arr.slice());
      const relevantCellsOnlyGrid = relevantCellsOnly(prev);
      console.log(
        "relevant\n",
        visualizedRelevantCells(relevantCellsOnly(cellGrid)),
      );
      for (const relevantCell of relevantCellsOnlyGrid) {
        console.debug(
          "next state",
          JSON.stringify(
            nextStateBasedOnNeighbors(relevantCell.position, prev),
          ),
        );
        newCellGrid[relevantCell.position.y][relevantCell.position.x] =
          nextStateBasedOnNeighbors(relevantCell.position, prev);
      }
      return newCellGrid;
    });
    // console.log(visualized(cellGrid));
  }

  function relevantCellsOnly(grid: CellState[][]): CellState[] {
    const relevantCellsOnlyGrid: CellState[] = [];
    const clonedGrid = grid.map((row) => row.slice());
    for (const row of clonedGrid) {
      for (const cell of row) {
        if (!cell.isAlive && !atLeastOneNeighborIsAlive(cell.position, grid)) {
          continue;
        }
        relevantCellsOnlyGrid.push(cell);
      }
    }
    return relevantCellsOnlyGrid;
  }

  function visualizedRelevantCells(relevantCellsOnlyGrid: CellState[]) {
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
  }

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

  function atLeastOneNeighborIsAlive(position: Position, grid: CellState[][]) {
    const neighbors = getLiveNeighbors(position, grid);
    console.log(`live neighbors\n${visualizedNeighbors(position, neighbors)}`);
    return neighbors.length > 0;
  }

  function visualizedNeighbors(position: Position, neighbors: CellState[]) {
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
  }

  function nextStateBasedOnNeighbors(position: Position, grid: CellState[][]) {
    const cell = cellAt(position);
    const liveNeighbors = getLiveNeighbors(position, grid);
    console.log(
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
  }

  function getLiveNeighbors(
    position: Position,
    grid: CellState[][],
  ): CellState[] {
    return getNeighbors(position, grid).filter((neighbor) => neighbor.isAlive);
  }

  function getNeighbors(position: Position, grid: CellState[][]): CellState[] {
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
      if (newY < 0 || newY > grid.length) {
        continue;
      }
      if (newX < 0 || newX > grid[0].length) {
        continue;
      }
      neighborsMatrix.push(grid[position.y + rowDiff][position.x + colDiff]);
    }
    return neighborsMatrix;

    // return MATRIX.map(([neighborColDiff, neighborRowDiff]) => {
    //   const newY = position.y + neighborRowDiff;
    //   const newX = position.x + neighborColDiff;
    //   if (!isInBounds(newY, "y") || !isInBounds(newX, "x")) {
    //     return undefined;
    //   }
    //   if (!grid[newY]) {
    //     console.warn("skip", { newX, newY });
    //     return;
    //   }
    //   return grid[newY][newX];
    // }).filter((matrixCell) => {
    //   return !!matrixCell;
    // });
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
