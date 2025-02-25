"use strict"

import Component from "../../common"
import { TCommunication} from "./types"
import { meters } from "../../common/types"
import { ECommMode } from "./enums"


export class Communication extends Component implements TCommunication{
    MACID    : string
    range    : meters
    frequency: number
    dataRate : number // kbps
    security : string[]
    commMode : ECommMode[]
}

export default Communication