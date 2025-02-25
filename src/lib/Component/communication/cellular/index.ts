"use strict"

import Communication from "../core"
import { TCellular } from "./types"
import { ECellularBand } from "./enums"
import { EHardwareInterface } from "../../common/enums"

export class Cellular extends Communication implements TCellular {
    hardwareInterface: EHardwareInterface
    bands: ECellularBand[]
    esn: number
    arn: string;
    constructor({serialNumber}:{serialNumber:string|number|symbol}){
        super({serialNumber})
    }
}