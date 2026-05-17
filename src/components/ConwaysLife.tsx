import { ConwaysLifeProvider } from "../context/ConwaysLifeProvider";
import { Actions } from "./Actions";
import { VirtualizedGrid } from "./Grid";

export function ConwaysLife() {
  return (
    <ConwaysLifeProvider width={1000} height={1000}>
      <div className="max-w-full max-h-270 overflow-scroll">
        <VirtualizedGrid />
      </div>
      <Actions />
    </ConwaysLifeProvider>
  );
}
