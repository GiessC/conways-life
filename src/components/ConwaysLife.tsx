import { ConwaysLifeProvider } from "../context/ConwaysLifeProvider";
import { Actions } from "./Actions";
import { VirtualizedGrid } from "./Grid";

export function ConwaysLife() {
  return (
    <ConwaysLifeProvider width={250} height={250}>
      <div className="max-w-full max-h-180 overflow-scroll">
        <VirtualizedGrid />
      </div>
      <Actions />
    </ConwaysLifeProvider>
  );
}
