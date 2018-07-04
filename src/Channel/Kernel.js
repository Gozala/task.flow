/* @flow */

import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"
import type { Thread, ThreadID } from "../Thread"
import type { Future } from "../Future"
import type { Poll } from "../Poll"
import type { Buffer } from "./Buffer/Buffer"

export class Pipe<message> {
  buffer: Buffer<message>
  readQueue: Array<FutureRead<message>>
  writeQueue: Array<FutureWrite<message>>
  closed: boolean
  scheduled: boolean
  constructor(
    buffer: Buffer<message>,
    readQueue: Array<FutureRead<message>>,
    writeQueue: Array<FutureWrite<message>>,
    closed: boolean,
    scheduled: boolean
  ) {
    this.buffer = buffer
    this.readQueue = readQueue
    this.writeQueue = writeQueue
    this.closed = closed
    this.scheduled = scheduled
  }
}

export class FutureWrite<message> implements Future<WriteError<message>, void> {
  static pool: Pool<FutureWrite<message>> = new Pool()
  static new(
    payload: message,
    thread: Thread,
    threadID: ThreadID
  ): FutureWrite<message> {
    const self = FutureWrite.pool.new(FutureWrite)
    self.payload = payload
    self.thread = thread
    self.threadID = threadID
    self.state = null
    return self
  }

  payload: message
  lifecycle: Lifecycle
  thread: Thread
  threadID: ThreadID
  state: "abort" | Poll<WriteError<message>, void>
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.state
    delete this.thread
    delete this.threadID
  }
  notify() {
    this.thread.notify(this.threadID)
  }
  poll(): Poll<WriteError<message>, void> {
    const { state } = this
    switch (state) {
      case "abort":
        return null
      case null:
        return null
      case undefined:
        return null
      default:
        this.delete()
        return state
    }
  }
  abort() {
    if (this.state == null) {
      this.state = "abort"
    }
  }
}

export class FutureRead<message> implements Future<ReadError, message> {
  static pool: Pool<FutureRead<message>> = new Pool()
  static new(thread: Thread, threadID: ThreadID): FutureRead<message> {
    const self = FutureRead.pool.new(FutureRead)
    self.thread = thread
    self.threadID = threadID
    self.state = null
    return self
  }

  lifecycle: Lifecycle
  thread: Thread
  threadID: ThreadID
  state: "abort" | Poll<ReadError, message>
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.state
    delete this.thread
    delete this.threadID
  }
  notify() {
    this.thread.notify(this.threadID)
  }
  poll(): Poll<ReadError, message> {
    const { state } = this
    switch (state) {
      case "abort":
        return null
      case null:
        return null
      case undefined:
        return null
      default:
        this.delete()
        return state
    }
  }
  abort() {
    if (this.state == null) {
      this.state = "abort"
    }
  }
}

export class WriteError<message> {
  payload: message
  stack: string
  message = "Failed to write into channel. This means channel is closed."
  name = "WriteError"
  constructor(payload: message) {
    this.payload = payload
    this.stack = new Error().stack
  }
}

export class ReadError {
  name = "ReadError"
  message =
    "Failed to read from channel. This means channel is closed buffered data is exhasted."
  stack: string
  constructor() {
    this.stack = new Error().stack
  }
}
