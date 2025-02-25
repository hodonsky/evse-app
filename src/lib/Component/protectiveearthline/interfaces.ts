"use strict"

import { volts } from "../common/types"
import { EProtectiveEarthLineState } from "./enums"

export interface IProtectiveEarthLine {
  id        : string | number | symbol;
  voltage   : volts;
  state     : EProtectiveEarthLineState;
  MACAddress: string; 
}