"use strict"

import Communication from "../core"
import { TSerial} from "./types"
import {
  EConnectionType,
  EBaudRate,
  EDataFormat,
  EDataAddress
} from "./enums"

export class Serial extends Communication implements TSerial{
  type       : EConnectionType
  baudRate   : EBaudRate
  pinCount   : number
  dataFormat : EDataFormat
  dataAddress: EDataAddress
  constructor({serialNumber}:{serialNumber:string|number|symbol}){
      super({serialNumber})
  }
}
export default Serial