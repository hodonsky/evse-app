"use strict"

import { ILED } from "./interfaces"

export type TLED = ILED & {
  turnOn() : void;
  turnOff(): void;
}

export type TLEDStrip = TLED