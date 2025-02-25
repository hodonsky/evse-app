"use strict"

import { EHardwareInterface } from "./enums"
import { celsius, watts } from "./types"

export interface IComponentConfiguration {
  /**
   * Unique serial number for the component.
   * @example "SN-987654"
   */
  serialNumber: string | number | symbol
}

export interface IComponent {
  /**
   * Unique serial number for the component.
   * @example "SN-987654"
   */
  serialNumber           : string | number | symbol
  /**
   * Name of the component.
   * @example "Cooling Fan"
   */
  name                  ?: string
  /**
   * Supported hardware interfaces (e.g., UART, SPI, I2C).
   */
  hardwareInterfaces    ?: EHardwareInterface[]
  /**
   * Operating temperature range in Celsius.
   * Represented as `[min, max]`.
   * @example [-10, 60]
   */
  operatingTemperature  ?: [ celsius, celsius]
  /**
   * Power consumption details in watts.
   */
  devicePowerConsumption?: {
    /** Standby power consumption (watts). */
    standby?: watts;
    /** Deep sleep power consumption (watts). */
    deepSleep?: watts;
    /** Active power consumption (watts). */
    active?: watts;
  }
}