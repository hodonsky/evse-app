"use strict"

export enum EConnectorType {
  "TYPE1" = "SAE_J1772",
  "TYPE2" = "IEC_62196_2",
  "CCS1" = "CCS_Type_1",
  "CCS2" = "CCS_Type_2",
  "CHADEMO" = "CHAdeMO",
  "TESLA" = "Tesla",
  "GB_T" = "GB/T",
  "TYPE3" = "Type3"
}
export enum ECommunicationProtocol {
  "SAE_J1772" = "SAE J1772",
  "IEC_62196_2" = "IEC 62196-2",
  "ISO_15118" = "ISO 15118",
  "CHADEMO" = "CHAdeMO",
  "TESLA" = "Tesla",
  "GB_T" = "GB/T",
  "TYPE3" = "Type3"
}
export enum EIsolationStatus {
  "PLUGGED" = "plugged",
  "UNPLUGGED" = "unplugged"
}
export enum EChargingMode {
  "AC" = "AC",
  "DC" = "DC"
}
export enum EGridStatus {
  "NOMINAL" = "nominal",
  "CONSTRAINED" = "constrained",
  "EMERGENCY" = "emergency"
}
export enum EDemandResponseStatus {
  "NONE" = 'none',
  "CONSTRAINED" = 'constrained',
  "UNCONSTRAINED" = 'unconstrained'
}
export enum EAvailability {
  OPERATIVE = "Operative",
  INOPERATIVE = "Inoperative"
}
export enum EErrorCode {
  NO_ERROR = "NoError",
  CONNECTOR_LOCK_FAILURE = "ConnectorLockFailure",
  GROUND_FAILURE = "GroundFailure",
  OVER_CURRENT_FAILURE = "OverCurrentFailure",
  POWER_METER_FAILURE = "PowerMeterFailure",
  POWER_SWITCH_FAILURE = "PowerSwitchFailure",
  READER_FAILURE = "ReaderFailure",
  RESET_FAILURE = "ResetFailure",
  UNDER_VOLTAGE = "UnderVoltage",
  OVER_VOLTAGE = "OverVoltage",
  WEAK_SIGNAL = "WeakSignal"
}
export enum EConnectorStatus {
  AVAILABLE      = "Available",
  UNAVAILABLE    = "Unavailable",
  OCCUPIED       = "Occupied",
  RESERVED       = "Reserved",
  FAULTED        = "Faulted",
  CHARGING       = "Charging",
  SUSPENDED_EV   = "SuspendedEV",
  SUSPENDED_EVSE = "SuspendedEVSE",
  FINISHING      = "Finishing"
}