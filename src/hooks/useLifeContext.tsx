import { useContext } from "react";
import { type ILifeContext, LifeContext } from "../context/LifeContext";

export function useLifeContext() {
  return useContext<ILifeContext>(LifeContext);
}
