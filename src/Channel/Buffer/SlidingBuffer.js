/* @flow */

import { ReadError, WriteError, Buffer } from "./Buffer"

export class SlidingBuffer<data> extends Buffer<data> {
  size: number
  chunks: Array<data>
  static ReadError = ReadError
  static WriteError = WriteError
  constructor(size: number) {
    super()
    this.size = size
    this.chunks = []
  }
  write(item: data): ?WriteError {
    if (this.chunks.length === this.size) {
      this.chunks.pop()
    }
    this.chunks.unshift(item)
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

export default SlidingBuffer
export { ReadError, WriteError }
