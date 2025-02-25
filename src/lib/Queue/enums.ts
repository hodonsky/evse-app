"use strict"

export enum EEventsQueueDBType {
  SQLITE3 = 'sqlite3',
  LEVELDB = 'leveldb',
  ROCKSDB = 'rocksdb',
  REDIS   = 'redis',
  MEMORY  = 'memory'
}