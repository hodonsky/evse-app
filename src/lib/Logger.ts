"use strict"

export default class Logger {
  constructor( ...args:any[] ){
    if ( args.length === 0 ){
      return console
    }
  }
}