"use strict"

import { EPLCCommType } from "./enums"
import { TPLCModem, TPLCPowerSupply } from "./types"
import Component from "../common"

export class PLCModem extends Component implements TPLCModem {
  commType   : EPLCCommType; // UART, Serial, SPI, Ethernet
  target     : string;
  powerSupply: TPLCPowerSupply;

  constructor( target:string, commType: EPLCCommType, serialNumber: string | number | symbol ){
    super({ serialNumber })

    switch( this.commType ){
      case EPLCCommType.UART: {
        this.target = target
        
      }; break;
      case EPLCCommType.SERIAL: {}; break;
      case EPLCCommType.SPI: {}; break;
      case EPLCCommType.ETHERNET: {}; break;
      default:{
        throw new Error( "Invalid commType" )
      }
    }


    this.emit("Initilized")
  }
}