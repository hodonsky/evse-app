"use strict"
import EventsObject from "./EventsObject"

interface IBase {
  id: string | number | symbol
}

type TBase = EventsObject & IBase & {
  getId(): string|number
}

/**
 * Represents a base class for hardware
 * This module manages general extensions for inter system references
 */
export class Base extends EventsObject implements TBase {
  /**
   * Unique identifier for the component.
   * Can be a string, number, or symbol.
   * @example "SN-123456" | 57139 | Symbol("SN-12345")
   */
  id:string|number|symbol;
  /**
   * Because the ID can be a symbol a simple get function to make access easy
   * @returns [string|number] from "this.id" property
   */
  getId = () => typeof this.id === "symbol" ? this.id.description! : this.id
}

export default Base