"use strict"

import Base from "../../Base"
import { EHardwareInterface } from "./enums"
import { TComponent, celsius, watts } from "./types"
import { IComponentConfiguration } from "./interfaces"

/**
 * Represents a hardware component in the system.
 * This module manages serial numbers, power consumption, and operational range.
 */
export class Component extends Base implements TComponent {
  /**
   * Unique identifier for the component.
   * Can be a string, number, or symbol.
   * @example "SN-123456"
   */
  serialNumber           : string | number | symbol
  /**
   * List of supported hardware interfaces (e.g., RS232, UART, SPI).
   */
  hardwareInterfaces    ?: EHardwareInterface[]

  /**
   * Name of the component.
   * @example "Power Module"
   */
  name                  ?: string
  /**
   * The operational temperature range (in Celsius).
   * Represented as [min, max] values.
   * @example [0, 50]
   */
  operatingTemperature  ?: [ celsius, celsius]
  /**
   * Power consumption details for different modes.
   */
  devicePowerConsumption?: {
    /** Power usage in standby mode (in watts). */
    standby?: watts;
    /** Power usage in deep sleep mode (in watts). */
    deepSleep?: watts;
    /** Power usage in active mode (in watts). */
    active?: watts;
  }
  /**
   * Creates a new Component instance.
   * @param {IComponentModuleConfiguration} configuration - The configuration object for the component.
   */
  constructor( configuration:IComponentConfiguration ){
    super()
    this.serialNumber = configuration.serialNumber
  }
  /**
   * Retrieves the component's serial number.
   * If the serial number is a symbol, returns its description.
   * @returns {string | number} The serial number of the component.
   * @example "SN-123456"
   */
  getSerialNumber = ():string|number => typeof this.serialNumber === "symbol" ? this.serialNumber.description! : this.serialNumber
}
export default Component