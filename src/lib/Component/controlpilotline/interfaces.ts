"use strict"

import { volts } from "../common/types"
import { EControlPilotLineState } from "./enums"

export interface IControlPilotLine {
  id        : string | number | symbol;
  voltage   : volts;
  state     : EControlPilotLineState;
  MACAddress: string; 
}