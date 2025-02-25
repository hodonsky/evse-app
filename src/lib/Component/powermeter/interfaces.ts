"use strict"

import {
  watts,
  deciwatts,
  deciwatthours,
  volts,
  TBaudRate,
  TComponent,
} from "../common/types"
import { TDisplay } from "../display/types"
import { TLED } from "../led/types"

interface IMeterPowerConsumption {
  voltageLineConsumption?: volts
  currentLineConsumption?: watts
  voltageWorkRange      ?: [volts, volts]
}
export interface IPowerMeterConfiguration {
  serialNumber          : string | number
  totalizer             : watts
  voltage               : volts
  deciWatts            ?: watts
  deciWattHours        ?: watts
  displays             ?: TDisplay[]
  indicators           ?: TLED[]
  meterPowerConsumption?: IMeterPowerConsumption
  path                 ?: string
  baudRate             ?: TBaudRate
  activelyMetering     ?: boolean
}

export interface IPowerMeter extends TComponent{
  totalizer            : deciwatts,
  voltage              : volts,
  deciWatts            : deciwatts,
  deciWattHours        : deciwatthours,
  activelyMetering     : boolean,
  display              ?: TDisplay,
  pulseIndicator       ?: TLED,
  path                 ?: string,
  baudRate             : TBaudRate,
  meterPowerConsumption?:IMeterPowerConsumption
}