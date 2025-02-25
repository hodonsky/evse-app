"use strict"

import Database from "./Database"
import { EventEmitter } from "events"
import { EEventsQueueDBType } from "./enums"
import { EEvent } from "../Transport/enums"

export interface IDatabaseConfiguration {
  host: string;
  port: number;
  path: string;
}

export interface IPayload {
  [key: string]: any;
  timestamp?: string;
}

export interface IEventSchema {
  id: string | number
  message: string
}

export interface IEventsQueue {
  queue      : IEventSchema[]
  eventStream: Generator
  db         : Database
  emitter    : EventEmitter
  events     : EEvent | EEvent[]
}

export interface IEventsQueueOptions {
  dbType: EEventsQueueDBType
  host ?: string
  path ?: string
  port ?: number
  events: EEvent | EEvent[]
}