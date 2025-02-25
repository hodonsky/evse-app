"use strict";

import Component from "../common"
import { watts, volts } from "../common/types"
import { TDisplay } from "../display/types"
import { TPowerMeter } from "./types"
import { IPowerMeterConfiguration } from "./interfaces"
import { TLED } from "../led/types"

const options = {
  displays:[],
  indicators:[],
}

export class PowerMeter extends Component implements TPowerMeter {
  totalizer:watts          = 0
  voltage:volts            = 0
  deciWatts:watts          = 0
  deciWattHours:watts      = 0
  activelyMetering:boolean = false
  displays:TDisplay[]      = []
  indicators:TLED[]        = []
  meterPowerConsumption    = {
    voltageLineConsumption: 0,
    currentLineConsumption: 0,
    voltageWorkRange      : [ 0, 0 ] as [ number, number]
  };
  path                    : "/dev/ttyUSB0";
  baudRate                : 9600;
  constructor( configuration: IPowerMeterConfiguration ){
    super( { serialNumber: configuration.serialNumber } )
    this.totalizer = configuration.totalizer
    this.voltage = configuration.voltage
    this.deciWatts = configuration.deciWatts ? configuration.deciWatts : this.deciWatts
    this.deciWattHours = configuration.deciWattHours ? configuration.deciWattHours : this.deciWattHours
    this.displays = configuration.displays ? configuration.displays : []
    this.indicators = configuration.indicators ? configuration.indicators : []
    this.meterPowerConsumption = {
      ...this.meterPowerConsumption,
      ...configuration.meterPowerConsumption
    }
  }
}

export default PowerMeter