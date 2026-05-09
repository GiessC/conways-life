import { CELL_SIZE_PX } from "../const";
import { useCell } from "../hooks/useCell";
import type { Position } from "../types";

export function Cell({ position }: { position: Position }) {
  const { isAlive, toggleAlive } = useCell(position);

  const colors: Record<string, string> = {
    true: "green",
    false: "black",
  };

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
      }}
    />
  );
}
