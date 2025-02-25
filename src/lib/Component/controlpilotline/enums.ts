"use strict"

export enum EControlPilotLineState {
  STATE_A = "STATE_A", // 12v - Disconnected
  STATE_B = "STATE_B", // 9v - Connected
  STATE_C = "STATE_C", // 6v - Ready
  STATE_D = "STATE_D", // 3v - Ventilation Required
  ERROR   = "ERROR"    // 0v - Error or Faulted State
}