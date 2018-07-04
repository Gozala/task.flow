/* @flow */

import { ReadError, WriteError, Buffer } from "./Buffer"

export class DroppingBuffer<data> extends Buffer<data> {
  size: number
  chunks: Array<data>
  static ReadError = ReadError
  static WriteError = WriteError
  constructor(size: number) {
    super()
    this.size = size
    this.chunks = []
  }
  write(chunk: data): ?WriteError {
    if (this.chunks.length !== this.size) {
      this.chunks.unshift(chunk)
    }
  }
  read(): ReadError | data {
    const { chunks } = this
    if (chunks.length > 0) {
      return chunks.pop()
    } else {
      return Buffer.readError
    }
  }
}

export default DroppingBuffer
export { ReadError, WriteError }
