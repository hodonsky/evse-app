"use strict"

export enum EConnectionType {
  RS232  = "RS232",
  RS485  = "RS485",
  UART   = "UART",
  SPI    = "SPI",
  USB_A  = "USB-A",
  USB_B  = "USB-B",
  USB_C  = "USB-C"
}

export enum EDataFormat {
  E_8_1 = "E-8-1"
}

export enum EDataAddress {
  MODBUS = "MODBUS",
  MODBUS_RTU = "MODBUS-RTU",
  DL_T654_2007 = "DL-T654-02007"
}

export enum EBaudRate {
  TWELVE_HUNDRED_BPS = "1200bps",
  TWENTY_FOUR_HUNDRED_BPS = "2400bps",
  FOURTY_EIGHT_HUNDRED_BPS = "4800bps",
  NINETY_SIX_HUNDRED_BPS = "9600bps"
}