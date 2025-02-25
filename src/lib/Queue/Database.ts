"use strict";
import {
    IDatabaseConfiguration,
    IEventSchema
 } from "./interfaces"
 import { EEventsQueueDBType } from "./enums"
 import { EEvent } from "../Transport/enums"

export class Database { //implements IDatabase {
    db:any = null
    dbType
    configuration:IDatabaseConfiguration = { host: "localhost", port: 5432, path: "/" }
    supportedDBTypes:EEventsQueueDBType[] = Object.values(EEventsQueueDBType)

    constructor( dbType:EEventsQueueDBType, configuration:IDatabaseConfiguration ) {
        if (!this.supportedDBTypes.includes(dbType)) {
            throw new Error(`Unsupported database type: ${dbType}`);
        }
        this.dbType = dbType
        this.configuration = configuration;
    }

    async initialize() {
      this.db = await this.#createClient();
      if (this.dbType === 'sqlite3') {
          await new Promise((resolve, reject) => {
            if ( this.db ) {
              this.db.run(
                  "CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)",
                  (err:Error) => {
                      if (err) reject(err);
                      else resolve( true );
                  }
              );
            }
          });
      }
    }

    async #createClient() {
      switch (this.dbType) {
        case 'sqlite3':
          try {
            const sqlite3 = await import('sqlite3'!);
            return new sqlite3.Database(this.configuration.path || ':memory:');
          } catch ( e ) {
            console.warn( e )
          }
        case 'leveldb':
          try {
            const level = await import('level'!);
            return level.default(this.configuration.path || './leveldb');
          } catch ( e ) {
            console.warn( e )
          }
        case 'rocksdb':
          try {
            const rocksdb = await import('rocksdb'!);
            return rocksdb(this.configuration.path || './rocksdb');
          } catch ( e ) {
            console.warn( e )
          }
        case 'redis':
          try {
            const redis = await import('redis'!);
            const client = redis.createClient({
                url: `redis://${this.configuration.host || 'localhost'}:${this.configuration.port || 6379}`,
                // Optional auth properties can be added here
            });
            await client.connect();
            return client;
          } catch ( e ) {
            console.warn( e )
          }
        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }
    }

    async insert(event:IEventSchema) {
        const eventStr = JSON.stringify(event.message);
        switch (this.dbType) {
            case 'sqlite3':
                await new Promise((resolve, reject) => {
                    this.db.run("INSERT INTO queue (id, event) VALUES (?)", [event.id, eventStr], (err:Error) => {
                        if (err) reject(err);
                        else resolve( true );
                    });
                });
                break;
            case 'leveldb':
            case 'rocksdb':
                await this.db.put(event.id, eventStr);
                break;
            case 'redis':
                await this.db.set(event.id, eventStr);
                break;
        }
    }

    async delete(event:{ id:string|number }) {
        switch (this.dbType) {
            case 'sqlite3':
                await new Promise((resolve, reject) => {
                    this.db.run("DELETE FROM queue WHERE id = ?", [event.id], (err:Error) => {
                        if (err) reject(err);
                        else resolve( true );
                    });
                });
                break;
            case 'leveldb':
            case 'rocksdb':
            case 'redis':
                await this.db.del(event.id);
                break;
        }
    }

    async fetchAll() {
        const events:EEvent[] = [];
        switch (this.dbType) {
            case 'sqlite3':
                return new Promise((resolve, reject) => {
                    this.db.all("SELECT id, event FROM queue ORDER BY id ASC", [], (err:Error, rows:any) => {
                        if (err) reject(err);
                        resolve(rows.map( (row:any) => {
                            const event:EEvent = JSON.parse( row )
                            events.push( event );
                        }));
                    });
                });
            case 'leveldb':
            case 'rocksdb':
                for await (const [_, value] of this.db.iterator()) {
                    const event:EEvent = JSON.parse(value)
                    events.push( event );
                }
                return events;
            case 'redis':
                const keys = await this.db.keys('*');
                for (const key of keys) {
                    const value = await this.db.get(key);
                    const event:EEvent = JSON.parse(value)
                    events.push( event );
                }
                return events;
        }
    }
}
export default Database