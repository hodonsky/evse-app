"use strict"

import Communication from "../core"
import { TBLE } from "./types"

export class BLE extends Communication implements TBLE {
  constructor({serialNumber}:{serialNumber:string|number|symbol}){
    super({serialNumber})
  } 
}