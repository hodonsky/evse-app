"use strict"

import { EventsQueue } from "../Queue"
import { EVSEConnector } from "../EVSEConnector"
import { Transport } from "../Transport/interfaces"

import { TDisplay } from "../Component/display/types"
import { TLED } from "../Component/led/types"
import { TPowerMeter } from "../Component/powermeter/types"
import { TPowerRelay, TConnectorRelay, TOverloadProtectionRelay } from "../Component/relay/types"

import { TSerial} from "../Component/communication/serial/types"
import { TBLE} from "../Component/communication/ble/types"
import { TRFID} from "../Component/communication/rfid/types"
import { TNFC} from "../Component/communication/nfc/types"
import { TLoRa} from "../Component/communication/lora/types"
import { TWiFi} from "../Component/communication/wifi/types"
import { TRJ45} from "../Component/communication/rj45/types"
import { TCellular } from "../Component/communication/cellular/types"

import {
  EAvailability,
  EChargingScheduleAllowedChargingRateUnit,
  ECurrentLevel,
  EDiagnosticStatus,
  EEventsQueueDBType,
  EMeterType,
  ENetworkModeEVSE,
  EPowerType,
  EVoltageLevel
} from "./enums"

export interface IPayload {
  [key: string]: any;
  timestamp   ?: string;
}

export interface IEVSEConfiguration {
  allowOfflineTxForUnknownId       : boolean, //true,
  authorizationCacheEnabled        : boolean, //false,
  clockAlignedDataInterval         : number, // 0,
  connectionTimeOut                : number, // 100, // ms
  getConfigurationMaxKeys          : number, // 128,
  heartbeatInterval                : number, // 300000, // ms
  localAuthorizeOffline            : boolean, //true,
  localPreAuthorize                : boolean, //false,
  meterValuesAlignedData           : number,
  meterValueSampleInterval         : number, //ms
  numberOfConnectors               : number, // 1,
  resetRetries                     : number, // 10,
  stopTransactionOnEVSideDisconnect: boolean, // true,
  stopTransactionOnInvalidId       : boolean  // true
}
export interface IEVSEEventsQueue {
  queue : EventsQueue | null,
  dbType?: EEventsQueueDBType,
  host  ?: string,
  port  ?: number
}
export interface IEVSEProperties {
  availability   : EAvailability;
  connectors     : EVSEConnector[];
  voltage        : EVoltageLevel
  current        : ECurrentLevel
  powerType      : EPowerType
  meterValue     : number
  id             : string | number;
  vendorId      ?: string
  model         ?: string
  serialNumber   : string
  lastHeartbeat ?: string
  location      ?: string
  maxPower      ?: number
  transport      : Transport[]
  eventsQueue    : IEVSEEventsQueue
  configuration  : IEVSEConfiguration
}

export interface IEVSE extends IEVSEProperties {}

export interface IEVSEOptionsEventsQueue {
  host  : string;
  port  : number | string;
  dbType: EEventsQueueDBType;
}

interface IConnectorRelay extends TPowerRelay {

}
export interface IIndicators {
  active   ?: TLED,
  charging ?: TLED,
  error    ?: TLED,
  faulted  ?: TLED,
  inactive ?: TLED
  preparing?: TLED,
  power    ?: TLED,
  updating ?: TLED,
}
export interface IHMIs {
  buttons     ?: [],
  screens     ?: TDisplay[],
  touchScreens?: TDisplay[],
  indicators  ?: IIndicators
}
export interface IComponentModules {
  hmis                    : IHMIs,
  powerMeters             : TPowerMeter[],
  evseRelays              : TPowerRelay[],
  connectorRelays         : TConnectorRelay[],
  overloadProtectionRelays: TOverloadProtectionRelay[],
  communications          : {
    serial  ?: TSerial[],   //RS232, RS485, USB(A/B/C)
    ble     ?: TBLE[],
    rfid    ?: TRFID[],
    nfc     ?: TNFC[],
    lora    ?: TLoRa[],
    wifi    ?: TWiFi[],
    rj45    ?: TRJ45[],
    cellular?: TCellular[]
  }
}

interface ISizeLWH {
  length: number,
  width : number, 
  height: number
}

export interface IEVSEOptions {
  id              : string | number;
  serialNumber    : string;
  size           ?: ISizeLWH;
  connectors      : EVSEConnector[];
  transport      ?: Transport[];
  eventsQueue    ?: Omit<IEVSEEventsQueue, "queue">;
  os             ?: IEVSEOSConfiguration;
  hardwareModules?: IComponentModules;
  configuration  ?: IEVSEConfiguration;
  manufacturer   ?: IEVSEManufacturerConfiguration;
}

// Energy Meter Types
export interface IEnergyMeter {
  type        : EMeterType.REVENUE_GRADE;
  currentValue: number;
  serialNumber: string;
}


export interface IFirmwareConfiguration {
  version         ?: string;
  downloadInterval?: number;
  downloadRetries ?: number;
}

export interface IGetDiagnosticsRequest {
  location: string;
  retries: number;
  retryInterval: number;
  startTime: string;
  stopTime: string;
}

export interface IGetDiagnosticResponse {
  filename: string;
}
export interface IDiagnostics {
  status       : EDiagnosticStatus
  timestamp    : string;
  path         : string;
  filename     : string;
  requestPeriod: string;
}

export interface IManufacturerLog {
  name: string;
  path: string;
}

export interface IDiagnosticsConfiguration{
  timestamp?: string;
  status   ?: EDiagnosticStatus;
}

export interface IEVSEOSConfiguration {
  temporaryDirectory?: string;
  firmware          ?: IFirmwareConfiguration;
  logs              ?: IManufacturerLog[];
  diagnostics       ?: IDiagnosticsConfiguration;
}

export interface IEVSEManufacturerConfiguration {
  vendor              : string;
  model               : string;
  chargeRate          : EChargingScheduleAllowedChargingRateUnit;
  autoReset           : boolean;
  energyMeter         : IEnergyMeter;
  overheatProtection  : boolean;
  networkMode         : ENetworkModeEVSE;
  userInterfaceEnabled: boolean;
  voltageLimit        : number | null;
  currentLimit        : number | null;
}