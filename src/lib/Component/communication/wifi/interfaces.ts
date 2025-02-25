"use strict"
import { gigahertz } from "../../common/types"
import { EHardwareInterface } from "../../common/enums"
import { TCommunication } from "../core/types"

import { EWiFiCertification, EWiFiEncryption, EWifiProtocol } from "./enums"

export interface IWiFi extends Omit<TCommunication, "frequency"> {
  protocols       : EWifiProtocol[],
  frequencies     : gigahertz[],
  interfaces      : EHardwareInterface[],
  certifications  : EWiFiCertification[],
  encryptions     : EWiFiEncryption[]
}