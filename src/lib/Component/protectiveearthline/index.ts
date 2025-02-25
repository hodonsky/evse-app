"use strict"

import { EProtectiveEarthLineState } from "./enums"
import { TProtectiveEarthLine }      from "./types"
import { volts }                     from "../common/types"
import Component               from "../common"

export class ProtectiveEarthLine extends Component implements TProtectiveEarthLine {
  voltage : volts;
  MACAddress: string;
  state: EProtectiveEarthLineState;
  constructor({ serialNumber }:{ serialNumber: string | number | symbol }){
    super({serialNumber})
  }
}