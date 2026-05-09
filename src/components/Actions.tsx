import { useState } from "react";
import { useLifeContext } from "../hooks/useLifeContext";
import { Speed } from "../types";
import { Button } from "./Button";

const SPEEDS = [
  { speed: Speed.normal(), label: "1x" },
  { speed: Speed.doubleTime(), label: "2x" },
  { speed: Speed.fourTimes(), label: "4x" },
  { speed: Speed.tenTimes(), label: "10x" },
];

export function Actions() {
  const { setSpeed, started, start, stop, resetGame, nextStep } =
    useLifeContext();
  const [speedIndex, setSpeedIndex] = useState(0);

  function incrementSpeed() {
    setSpeedIndex((prev) => {
      const newIndex = (prev + 1) % SPEEDS.length;
      setSpeed(SPEEDS[newIndex].speed);
      return newIndex;
    });
  }

  return (
    <div className="flex mt-2 gap-x-2">
      <Button onClick={started ? stop : start}>
        {started ? "Stop" : "Start"}
      </Button>
      <Button onClick={nextStep}>Next</Button>
      <Button onClick={incrementSpeed}>
        Speed: {SPEEDS[speedIndex].label}
      </Button>
      <Button onClick={resetGame}>Clear</Button>
    </div>
  );
}
