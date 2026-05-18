import type { CellState, Position } from "../types";
import { useGrid, type IGrid } from "./useGrid";
import { expect, describe, test, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { OutOfBoundsError } from "../errors/outOfBounds.error";

describe("useGrid", () => {
  const WIDTH: number = 50;
  const HEIGHT: number = 50;

  let grid: IGrid;

  function initGrid(): IGrid {
    const { result } = renderHook(() => useGrid(WIDTH, HEIGHT));
    return result.current;
  }

  beforeEach(() => {
    grid = initGrid();
  });

  describe("get cell", () => {
    test("at position when alive", () => {
      // Given
      const position: Position = { x: 0, y: 0 };
      act(() => {
        grid.setAlive(position, true);
      });

      // When
      const cell = grid.get(position);

      // Then
      const expectedCellState: CellState = {
        isAlive: true,
        position,
      };
      expect(cell).toEqual(expectedCellState);
    });

    test("at position when dead with no live neighbors", () => {
      // Given
      const position: Position = { x: 5, y: 5 };

      // When
      const cell = grid.get(position);

      // Then
      const expectedCellState: CellState = {
        isAlive: false,
        position,
      };
      expect(cell).toEqual(expectedCellState);
    });

    test("out of bounds cell throws error", () => {
      // Given
      const position: Position = { x: -1, y: 0 };

      // When
      const act = () => grid.get(position);

      // Then
      expect(act).toThrow(new OutOfBoundsError(position));
    });
  });

  describe("in bounds", () => {
    test("returns false when x too low", () => {
      // Given
      const position: Position = { x: -1, y: 0 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(false);
    });

    test("returns false when y too low", () => {
      // Given
      const position: Position = { x: 0, y: -1 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(false);
    });

    test("returns false when x too high", () => {
      // Given
      const position: Position = { x: WIDTH, y: 0 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(false);
    });

    test("returns false when y too high", () => {
      // Given
      const position: Position = { x: 0, y: HEIGHT };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(false);
    });

    test("returns true when in bounds", () => {
      // Given
      const position: Position = { x: 3, y: 3 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(true);
    });

    test("returns true when in top left", () => {
      // Given
      const position: Position = { x: 0, y: 0 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(true);
    });

    test("returns true when in top right", () => {
      // Given
      const position: Position = { x: WIDTH - 1, y: 0 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(true);
    });

    test("returns true when in bottom left", () => {
      // Given
      const position: Position = { x: 0, y: HEIGHT - 1 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(true);
    });

    test("returns true when in bottom right", () => {
      // Given
      const position: Position = { x: WIDTH - 1, y: HEIGHT - 1 };

      // When
      const result = grid.inBounds(position);

      // Then
      expect(result).toBe(true);
    });
  });

  describe("toggle alive", () => {
    test("dead goes to alive", () => {
      // Given
      // When
      act(() => {
        grid.toggleAlive({ x: 0, y: 0 });
      });

      // Then
      const cell = grid.get({ x: 0, y: 0 });
      expect(cell.isAlive).toBe(true);
    });

    test("alive goes to dead", () => {
      // Given
      act(() => {
        grid.setAlive({ x: 0, y: 0 }, true);
      });

      // When
      act(() => {
        grid.toggleAlive({ x: 0, y: 0 });
      });

      // Then
      const cell = grid.get({ x: 0, y: 0 });
      expect(cell.isAlive).toBe(false);
    });
  });

  describe("set alive", () => {
    test("sets to true", () => {
      // Given
      // When
      act(() => {
        grid.setAlive({ x: 0, y: 0 }, true);
      });

      // Then
      const cell = grid.get({ x: 0, y: 0 });
      expect(cell.isAlive).toBe(true);
    });

    test("sets to false", () => {
      // Given
      act(() => {
        grid.setAlive({ x: 0, y: 0 }, true);
      });

      // When
      act(() => {
        grid.setAlive({ x: 0, y: 0 }, false);
      });

      // Then
      const cell = grid.get({ x: 0, y: 0 });
      expect(cell.isAlive).toBe(false);
    });

    test("doesn't throw on out of bounds", () => {
      // Given
      // When
      const action = () =>
        act(() => {
          grid.setAlive({ x: -1, y: 0 }, true);
        });

      // Then
      expect(action).not.toThrow(new OutOfBoundsError({ x: -1, y: 0 }));
    });
  });

  describe("conditionallyUpdateAll", () => {
    test("updates based on function", () => {
      // When
      act(() => {
        grid.conditionallyUpdateAll((cell) => {
          if (cell.position.x === 0 && cell.position.y === 0) {
            return { ...cell, isAlive: true };
          }
          return cell;
        });
      });

      // Then
      const origin = grid.get({ x: 0, y: 0 });
      expect(origin.isAlive).toBe(true);
    });
  });

  describe("reset", () => {
    test("sets live cells to dead", () => {
      // Given
      act(() => {
        grid.setAlive({ x: 1, y: 1 }, true);
        grid.setAlive({ x: 2, y: 1 }, true);
        grid.setAlive({ x: 3, y: 1 }, true);
      });

      // When
      act(() => {
        grid.reset();
      });

      // Then
      const cells = [
        grid.get({ x: 1, y: 1 }),
        grid.get({ x: 2, y: 1 }),
        grid.get({ x: 3, y: 1 }),
      ];
      expect(cells.map((cell) => cell.isAlive)).toEqual([false, false, false]);
    });
  });
});
