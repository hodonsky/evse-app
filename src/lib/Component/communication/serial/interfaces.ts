"use strict"

import { TComponent} from "../../common/types"
import {
  EBaudRate,
  EConnectionType,
  EDataAddress,
  EDataFormat
} from "./enums"

export interface ISerial extends TComponent{
  type       : EConnectionType,
  baudRate   : EBaudRate,
  pinCount   : number,
  dataFormat : EDataFormat,
  dataAddress: EDataAddress
}