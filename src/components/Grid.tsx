import { useMemo } from "react";
import { CELL_SIZE_PX } from "../const";
import { useLifeContext } from "../hooks/useLifeContext";
import { Cell } from "./Cell";

export function Grid() {
  const { dimensions, cellGrid } = useLifeContext();

  const divStyles = useMemo(
    () => ({
      width: dimensions.width * CELL_SIZE_PX,
      height: dimensions.height * CELL_SIZE_PX,
    }),
    [dimensions],
  );

  return (
    <div style={divStyles}>
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
