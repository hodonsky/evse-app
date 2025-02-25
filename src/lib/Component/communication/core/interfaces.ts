"use strict"

import { TComponent} from "../../common/types"
import { meters } from "../../common/types"
import { ECommMode } from "./enums"

export interface ICommunication extends TComponent{
  MACID    : string,
  range    : meters,
  frequency: number,
  dataRate : number, // kbps
  security : string[],
  commMode : ECommMode[]  
}