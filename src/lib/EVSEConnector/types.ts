"use strict"

import {
  IEVSEConnector,
  IType1Connector,
  IType2Connector,
  ICCSConnector,
  ICHAdeMOConnector,
  ITeslaConnector,
  IGBTConnector,
  IType3Connector
} from "./interfaces"

export type TEVSEConnector = IEVSEConnector
export type TType1Connector = IType1Connector
export type TType2Connector = IType2Connector
export type TCCSConnector = ICCSConnector
export type TCHAdeMOConnector = ICHAdeMOConnector
export type TTeslaConnector = ITeslaConnector
export type TGBTConnector = IGBTConnector
export type TType3Connector = IType3Connector