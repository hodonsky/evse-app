"use strict"

import Component from "../common"
import { ECurrentType } from "../common/enums"
import { ESwitchType } from "../switch/enums"
import { ERelayContacts, ERelayPosition, ERelayType } from "./enums"
import { IRelay, IRelayConfiguration } from "./interfaces"

import { sendSerialCommand } from "../../utils"

export class Relay extends Component implements IRelay {
  path           : string
  type           : ERelayType
  switchType     : ESwitchType
  contacts       : ERelayContacts[] = []
  position       : ERelayPosition
  coilVoltage    : number
  coilCurrentType: ECurrentType
  loadCurrent    : number
  loadCurrentType: ECurrentType
  loadVoltage    : number
  constructor( configuration: IRelayConfiguration ){
    super({ serialNumber: configuration.serialNumber })
    Object.assign( this, configuration )
  }
  async open():Promise<boolean> {
    return await sendSerialCommand( this.path, {
                    command     : "OpenPowerRelay",
                    serialNumber: this.serialNumber
                  })
                  ? ( this.position = ERelayPosition.OPEN, true )
                  : false
  }
  async close():Promise<boolean> {
    await sendSerialCommand( this.path, {
      command     : "GetPowerRelayStatus",
      serialNumber: this.serialNumber
    })
    return await sendSerialCommand( this.path, {
                    command     : "ClosePowerRelay",
                    serialNumber: this.serialNumber
                  })
                  ? ( this.position = ERelayPosition.CLOSED, true )
                  : false
  }
  status(){ return { position: this.position } }
}

export class PowerRelay extends Relay {
  type: ERelayType = ERelayType.POWER
  constructor( configuration: IRelayConfiguration){
    super(configuration)
  }
}
export class OverCurrentRelay extends Relay {
  type: ERelayType = ERelayType.OVERLOAD_PROTECTION
  constructor( configuration: IRelayConfiguration){
    super(configuration)
  }
}