"use strict"

import { EControlPilotLineState } from "./enums"
import { TControlPilotLine }      from "./types"
import { volts }                  from "../common/types"
import Component            from "../common"

export class ControlPilotLine extends Component implements TControlPilotLine {
  voltage   : volts;
  MACAddress: string;
  state     : EControlPilotLineState;
  target    : string // /tty/uart1 via UART, SPI, or I2C to manage PLC communication. So Serial Connection
  constructor( {target, serialNumber}: { target: string, serialNumber: string | number | symbol } ){ //target could be a Serial Port
    super( { serialNumber })
    this.target = target
    
  }

  updateState( newState: EControlPilotLineState ):void {
    this.state = newState
    this.emit( "stateUpdate", newState )
  }

}