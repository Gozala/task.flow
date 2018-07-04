/* @flow */

import { Buffer, ReadError, WriteError } from "./Buffer"

export class FixedBuffer<value> extends Buffer<value> {
  size: number
  chunks: Array<value>
  static ReadError = ReadError
  static WriteError = WriteError
  constructor(size: number) {
    super()
    this.size = size
    this.chunks = []
  }
  write(item: value): ?WriteError {
    if (this.chunks.length === this.size) {
      return Buffer.writeError
    } else {
      this.chunks.unshift(item)
    }
  }
  read(): value | ReadError {
    const { chunks } = this
    if (chunks.length > 0) {
      return chunks.pop()
    } else {
      return Buffer.readError
    }
  }
}

export default FixedBuffer
export { ReadError, WriteError }
