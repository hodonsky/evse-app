"use strict"

import { EHardwareInterface } from "../../common/enums"
import { ECellularBand } from "./enums"

export interface ICellular {
  hardwareInterface: EHardwareInterface
  bands: ECellularBand[],
  esn: number,
  arn: string;
}