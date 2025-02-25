"use strict"
import { volts } from "../Component/common/types"
import { TPowerMeter } from "../Component/powermeter/types"
import { TControlPilotLine } from "../Component/controlpilotline/types"
import { TProtectiveEarthLine } from "../Component/protectiveearthline/types"
import { TRelay } from "../Component/relay/types"
import { 
  EConnectorType,
  ECommunicationProtocol,
  EIsolationStatus,
  EChargingMode,
  EGridStatus,
  EDemandResponseStatus,
  EConnectorStatus
} from "./enums"

export interface IEVSEConnectorRelays {
  power       : TRelay;
  overCurrent?: TRelay;
}
export interface IEVSEConnectorOptions {
  id            : string | number | symbol;
  connectorType : EConnectorType
  chargingMode  : EChargingMode
  maxVoltage   ?: number;
  maxCurrent   ?: number;
  cableLength  ?: number;
  powerMeters  ?: TPowerMeter[];
  relays        : IEVSEConnectorRelays;
  displayName  ?: string;
}

export interface IEVSEConnector {
  status               : EConnectorStatus;
  connectorType        : EConnectorType;
  maxVoltage           : number;
  maxCurrent           : number;
  cableLength         ?: number;
  isConnected          : boolean;
  isCharging           : boolean;
  powerOutput          : number;
  isolationStatus      : EIsolationStatus;
  vehicleSoc           : number;
  targetSoc            : number;
  chargingMode         : EChargingMode;
  communicationProtocol: string;
  energyPrice          : number;
  gridStatus           : EGridStatus;
  demandResponseStatus : EDemandResponseStatus;
  powerMeters          : TPowerMeter[];
  relays               : IEVSEConnectorRelays;
  controlPilotLine     : TControlPilotLine;
  protectiveEarthLine  : TProtectiveEarthLine;
  displayName         ?: string;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startCharging(): Promise<void>;
  stopCharging(): Promise<void>;
  updateSoc(soc: number): void;
  setTargetSoc(targetSoc: number): void;
  setEnergyPrice(price: number): void;
  updateGridStatus(status: EGridStatus): void;
  setDemandResponseStatus(status: EDemandResponseStatus): void;
  getStatus(): Record<string, unknown>;
}

export interface IType1Connector extends IEVSEConnector {
  connectorType: EConnectorType.TYPE1;
  communicationProtocol: ECommunicationProtocol.SAE_J1772;
}

export interface IType2Connector extends IEVSEConnector {
  connectorType: EConnectorType.TYPE2;
  communicationProtocol: ECommunicationProtocol.IEC_62196_2;
}

export interface ICCSConnector extends IEVSEConnector {
  connectorType: EConnectorType.CCS1 | EConnectorType.CCS2;
  chargingMode: EChargingMode;
  communicationProtocol: ECommunicationProtocol.ISO_15118;
}

export interface ICHAdeMOConnector extends IEVSEConnector {
  connectorType: EConnectorType.CHADEMO;
  chargingMode: EChargingMode;
  communicationProtocol: ECommunicationProtocol.CHADEMO;
}

export interface ITeslaConnector extends IEVSEConnector {
  connectorType: EConnectorType.TESLA;
  communicationProtocol: ECommunicationProtocol.TESLA;
}

export interface IGBTConnector extends IEVSEConnector {
  connectorType: EConnectorType.GB_T;
  communicationProtocol: ECommunicationProtocol.GB_T;
}

export interface IType3Connector extends IEVSEConnector {
  connectorType: EConnectorType.TYPE3;
  communicationProtocol: ECommunicationProtocol.TYPE3;
}