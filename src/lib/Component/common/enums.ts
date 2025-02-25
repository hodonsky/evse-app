"use strict"

export enum ECurrentType {
  ALTERNATING_CURRENT = "ALTERNATING_CURRENT",
  DIRECT_CURRENT      = "DIRECT_CURRENT",
  AC                  = "ALTERNATING_CURRENT",
  DC                  = "DIRECT_CURRENT"
}

export enum EHardwareInterface {
  UART   = "UART",
  SPI    = "SPI",
  I2C    = "I2C",
  GPIO   = "GPOIO",
  SERIAL = "SERIAL"
}

export enum EColor {
  RED    = "RED",
  GREEN  = "GREEN",
  BLUE   = "BLUE",
  WHITE  = "WHITE",
  YELLOW = "YELLOW",
  PURPLE = "PURPLE",
  MULTI  = "MULTICOLOR"
}