/* @flow */

import type { Thread, Future, Task, Park } from "task.type.flow"
import Kernel from "./Task"
import Buffer from "./Channel/Buffer/Buffer"
import FixedBuffer from "./Channel/Buffer/FixedBuffer"
import {
  WriteError,
  ReadError,
  FutureRead,
  FutureWrite,
  Pipe
} from "./Channel/Kernel"
import { enqueue } from "./Channel/Scheduler"
import { Writable } from "stream"

export class Writer<message> {
  pipe: Pipe<message>
  constructor(pipe: Pipe<message>) {
    this.pipe = pipe
  }
  write<x>(payload: message): Task<x | WriteError<message>, void> {
    return write(payload, this)
  }
  close<x>(): Task<x, void> {
    return close(this)
  }
}

export class Reader<message> {
  pipe: Pipe<message>
  constructor(pipe: Pipe<message>) {
    this.pipe = pipe
  }
  read<x>(): Task<x | ReadError, message> {
    return read(this)
  }
  close<x>(): Task<x, void> {
    return close(this)
  }
}

class Read<x, message> extends Kernel<x | ReadError, message> {
  pipe: Pipe<message>
  constructor(pipe: Pipe<message>) {
    super()
    this.pipe = pipe
  }
  spawn(thread: Thread): Future<x | ReadError, message> {
    const { pipe } = this
    const { buffer, readQueue } = pipe
    let chunk = buffer.read()
    if (chunk instanceof Buffer.ReadError) {
      const futureRead = FutureRead.new(thread)
      readQueue.push(futureRead)
      enqueue(pipe)
      return futureRead
    } else {
      enqueue(pipe)
      return Kernel.succeed(chunk)
    }
  }
}

class Write<x, message> extends Kernel<x | WriteError<message>, void> {
  payload: message
  pipe: Pipe<message>
  constructor(pipe: Pipe<message>, payload: message) {
    super()
    this.pipe = pipe
    this.payload = payload
  }
  spawn(thread: Thread): Future<x | WriteError<message>, void> {
    const { pipe, payload } = this
    const { buffer, closed, writeQueue } = pipe
    // If pipe is closed or buffer is full, create a pending write. This will
    // gives us following guarantees:
    // - Writing to colsed channel fails on next tick.
    // - Writing to full channel queues writes until next read.
    if (closed || buffer.write(payload) instanceof Buffer.WriteError) {
      console.log("queue write", pipe)
      const futureWrite = FutureWrite.new(payload, thread)
      writeQueue.push(futureWrite)
      console.log(pipe)
      enqueue(pipe)
      console.log(pipe)
      return futureWrite
      // If write to buffer was successful succeed without blocking.
    } else {
      enqueue(pipe)
      return Kernel.succeed()
    }
  }
}

class Close<error, message> extends Kernel<error, void> {
  pipe: Pipe<message>
  constructor(pipe: Pipe<message>) {
    super()
    this.pipe = pipe
  }
  spawn(thread: Thread): Future<error, void> {
    const { pipe } = this
    pipe.closed = true
    enqueue(pipe)
    return Kernel.succeed()
  }
}

class Open<never, message> extends Kernel<never, Channel<message>> {
  buffer: Buffer<message>
  constructor(buffer: Buffer<message>) {
    super()
    this.buffer = buffer
  }
  spawn(): Future<never, Channel<message>> {
    const pipe = new Pipe(this.buffer, [], [], false, false)
    return Kernel.succeed(new Channel(new Writer(pipe), new Reader(pipe)))
  }
}

export const open = <x, message>(
  buffer: Buffer<message> = new FixedBuffer(0)
): Task<x, Channel<message>> => new Open(buffer)

export const write = <x, message>(
  payload: message,
  writer: Writer<message>
): Task<x | WriteError<message>, void> => new Write(writer.pipe, payload)

export const read = <x, message>(
  reader: Reader<message>
): Task<x | ReadError, message> => new Read(reader.pipe)

export const close = <error, message>(
  port: Reader<message> | Writer<message>
): Task<error, void> => new Close(port.pipe)

export class Channel<message> {
  static read = read
  static write = write
  static close = close
  static open = open
  static ReadError = ReadError
  static WriteError = WriteError
  static Reader = Reader
  static Writer = Writer
  reader: Reader<message>
  writer: Writer<message>
  constructor(writer: Writer<message>, reader: Reader<message>) {
    this.writer = writer
    this.reader = reader
  }
  read(): Task<ReadError, message> {
    return read(this.reader)
  }
  write(payload: message): Task<WriteError<message>, void> {
    return write(payload, this.writer)
  }
  close(): Task<empty, void> {
    return close(this.writer)
  }
}

export { ReadError, WriteError }
export default Channel
