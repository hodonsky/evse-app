"use strict"
import { v4 } from "uuid"
import { IEventsQueueOptions, IEventSchema, IPayload } from "./interfaces"
import { TEventsQueue } from "./types"
import { EEventsQueueDBType } from "./enums"
import { EEvent } from "../Transport/enums"
import { EventEmitter } from "events"
import Database from "./Database"


export class EventsQueue implements TEventsQueue{
  queue      : IEventSchema[]     = []
  eventStream: Generator
  db         : Database
  emitter    : EventEmitter       = new EventEmitter()
  events     : EEvent | EEvent[] = []
  constructor({ dbType = EEventsQueueDBType.MEMORY, host, path, port , events }: IEventsQueueOptions) {
    this.events = events
    this.eventStream = this._eventGenerator();
    if ( !(this instanceof EventsQueue) ) {
      return new EventsQueue( arguments[0] )
    }
    return (async () => {
      if ( dbType === EEventsQueueDBType.MEMORY){
        console.warn( "Queue will not persist, dbType[memory]" )
      } else {
        if ( !host ){
          throw new Error( `Missing {host} on intilizer` )
        } else if (!port ) {
          throw new Error( `Missing {port} on intilizer` )
        } else if ( !path ) {
          throw new Error( `Missing {path} on intilizer` )
        }
        const db = await new Database( dbType, { path, host, port } )
        if ( !(db instanceof Database) ) {
          console.warn("Invalid database instance provided.");
        } else {
          this.db = db;
          try {
            await this.db.initialize()
          } catch ( e ) {
            console.error( e )
          }
        }
      }
      return this
    })() as unknown as this
  }
  async hydrate():Promise<void>{
    try {
      if (this.db) { this.queue.push( ...( await this.db.fetchAll() ) as any[] ) }
    } catch (e) {
      console.error( e )
    }
  }
  *_eventGenerator():Generator {
    while (true) {
      yield this.queue.length === 0 ? null : this.queue.shift()
    }
  }
  async enqueue( eventInfo: string ):Promise<boolean>{
    const event:IEventSchema = {id: v4(), message: eventInfo }
    try{
      if (this.db) {
        await this.db.insert(event);
      }
    } catch ( e ){
      console.error( e )
    } finally {
      this.queue.push(event)
      return true
    }
  }
  async dequeue():Promise<IEventSchema> {
    const event:IEventSchema = this.eventStream.next().value
    try{
      event && this.db ? await this.db.delete(event) : null
    } catch ( e ){
      console.error( e )
    }
    return event
  }
  get length():number {
    return this.queue.length
  }
  on( eventName: string, callBack: Function | any ):void{
    this.emitter.on( eventName, callBack )
  }
  off( eventName: string, callBack: Function | any ):void{
    this.emitter.off( eventName, callBack )
  }
  async enqueueEvent( method: string, payload?: IPayload ):Promise<void>{
    const event = JSON.stringify({ method, payload})
    try {
      await this.enqueue( event )
      this.emitter.emit( "EVENT_QUEUED", event )
    } catch ( e ){
      console.error( e )
    }
  }
  async dequeueEvent():Promise<{method:string,payload:IPayload}>{
    const event = JSON.parse((await this.dequeue()).message)
    try{
      this.emitter.emit( "EVENT_DEQUEUED", event )
    } catch ( e ){
      console.error( e )
    } finally {
      return event
    }
  }
}