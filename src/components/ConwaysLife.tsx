import { ConwaysLifeProvider } from "../context/ConwaysLifeProvider";
import { Actions } from "./Actions";
import { Grid } from "./Grid";

export function ConwaysLife() {
  return (
    <ConwaysLifeProvider width={80} height={80}>
      <div>
        <Grid />
        <Actions />
      </div>
    </ConwaysLifeProvider>
  );
}
