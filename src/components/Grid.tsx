import { CELL_SIZE_PX } from "../const";
import { useLifeContext } from "../hooks/useLifeContext";
import { Cell } from "./Cell";
import { Grid } from "react-window";

export function VirtualizedGrid() {
  const { dimensions } = useLifeContext();

  return (
    <Grid
      cellComponent={Cell}
      cellProps={{}}
      columnCount={dimensions.width}
      columnWidth={CELL_SIZE_PX}
      rowCount={dimensions.height}
      rowHeight={CELL_SIZE_PX}
    />
  );
}
