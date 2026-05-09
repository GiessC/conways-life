export interface CellState {
  position: Position;
  isAlive: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export class Speed {
  private rateInSeconds: number;

  private constructor(rateInSeconds: number) {
    this.rateInSeconds = rateInSeconds;
  }

  public static normal() {
    return new Speed(0.5);
  }

  public static doubleTime() {
    return new Speed(0.25);
  }

  public static fourTimes() {
    return new Speed(0.125);
  }

  public static tenTimes() {
    return new Speed(0.05);
  }

  public toSeconds(): number {
    return this.rateInSeconds;
  }
}
