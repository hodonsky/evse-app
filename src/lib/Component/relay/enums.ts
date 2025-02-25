"use strict"

export enum ERelayContacts {
  COIL_P = "COIL_P",
  COIL_N = "COIL_N",
  COMMON = "COMMON",
  NORMALLY_OPEN = "NORMALLY_OPEN",
  NORMALLY_CLOSED = "NORMALLY_CLOSED",
  C = "COMMON",
  NO = "NORMALLY_OPEN",
  NC = "NORMALLY_CLOSED"
}

export enum ERelayPosition {
  OPEN = "OPEN",
  CLOSED = "CLOSED"
}
export enum ERelayType {
  ELECTROMAGNETIC     = "ELECTROMAGNETIC",
  EM                  = "ELECTROMAGNETIC",
  SOLID_STATE         = "ELECTROMAGNETIC",
  SS                  = "ELECTROMAGNETIC",
  HYBRID              = "HYBRID",
  REED                = "REED",
  LATCHING            = "LATCHING",
  TIME_DELAY          = "TIME_DELAY",
  OVERLOAD_PROTECTION = "OVERLOAD_PROTECTION",
  POWER               = "POWER"
}