// @flow

export class ReadError {
  message: string
  stack: string
  name = "ReadError"
  constructor(message: string) {
    this.message = message
    this.stack = new Error(message).stack
  }
}

export class WriteError {
  message: string
  stack: string
  name = "WriteError"
  constructor(message: string) {
    this.message = message
    this.stack = new Error(message).stack
  }
}

export class Buffer<data> {
  static ReadError = ReadError
  static WriteError = WriteError
  static writeError = new WriteError(
    "Not enough space in buffer to fit a write"
  )
  static readError = new ReadError(
    "Not enough data in buffer to perform a read"
  )
  write(chunk: data): ?WriteError {
    return Buffer.writeError
  }
  read(): data | ReadError {
    return Buffer.readError
  }
}

export default Buffer
