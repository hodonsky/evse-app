"use strict"

import Communication from "../core"
import { gigahertz } from "../../common/types"
import { EHardwareInterface } from "../../common/enums"
import { TWiFi} from "./types"
import {
  EWifiProtocol,
  EWiFiCertification,
  EWiFiEncryption
} from "./enums"

export class WiFi extends Communication implements TWiFi{
    protocols       : EWifiProtocol[]
    frequencies     : gigahertz[]
    interfaces      : EHardwareInterface[]
    certifications  : EWiFiCertification[]
    encryptions     : EWiFiEncryption[]
    constructor({serialNumber}:{serialNumber:string|number|symbol}){
        super({serialNumber})
    }
}
export default WiFi