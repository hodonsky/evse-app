"use strict"
import { IComponent} from "./interfaces"


export type TComponent= IComponent& {
  getSerialNumber():string|number
}

export type volts         = number;
export type deciwatts     = number; 
export type deciwatthours = number;
export type watts         = number;
export type whatthours    = number;
export type meters        = number;
export type hertz         = number; // 50, 60
export type gigahertz     = number; // 2.4, 5, 6
export type temperature   = number;
export type fahrenheit    = temperature;
export type celsius       = temperature;
export type ohms          = number;

export type TBaudRate = 2400 | 4800 | 9600 | 14400 | 19200 | 38400;