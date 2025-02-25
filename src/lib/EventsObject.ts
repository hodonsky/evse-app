import { EventEmitter, once } from "events"

export class EventsObject extends EventEmitter {
  once( eventName: string, options?:any ) {
    once( this, eventName, options )
    return this
  }
}
export default EventsObject