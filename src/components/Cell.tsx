import type { CellComponentProps } from "react-window";
import { CELL_SIZE_PX } from "../const";
import { useCell } from "../hooks/useCell";
import type { Position } from "../types";
import { useMemo } from "react";

export function Cell({
  style,
  columnIndex: x,
  rowIndex: y,
}: CellComponentProps) {
  const position: Position = { x, y };
  const { isAlive, toggleAlive, getNeighbors } = useCell(position);

  const colors: Record<string, string> = {
    true: "green",
    false: "black",
  };

  const isRelevantCell = useMemo(() => {
    if (isAlive) {
      return true;
    }
    if (getNeighbors().some((neighbor) => neighbor.isAlive)) {
      return true;
    }
    return false;
  }, [isAlive, getNeighbors]);

  return (
    <div
      onClick={() => toggleAlive()}
      style={{
        width: CELL_SIZE_PX,
        height: CELL_SIZE_PX,
        borderWidth: "1px",
        borderTop: 0,
        borderRight: 0,
        borderColor: "white",
        backgroundColor: colors[String(isAlive)],
        ...style,
      }}
    >
      {isRelevantCell && import.meta.env.VITE_DEBUG === "true"
        ? `x: ${position.x}\ny: ${position.y}`
        : ""}
    </div>
  );
}
