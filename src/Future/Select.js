// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Future } from "./Future"
import type { Poll } from "../Poll"
import { wait } from "../Poll"
import Pool from "../Pool"
import type { Lifecycle } from "../Pool"

class Select<x, a> implements Future<x, a> {
  static pool: Pool<Select<x, a>> = new Pool()
  left: Future<x, a>
  right: Future<x, a>
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  poll(): Poll<x, a> {
    const left = this.left.poll()
    if (left.isReady === true) {
      this.right.abort()
      this.delete()
      return left
    } else {
      const right = this.right.poll()
      if (right.isReady === true) {
        this.left.abort()
        this.delete()
        return right
      } else {
        return wait
      }
    }
  }
  abort() {
    this.left.abort()
    this.right.abort()
  }
  delete() {
    delete this.left
    delete this.right
    Select.pool.delete(this)
  }
}

export default <x, a>(
  left: Future<x, a>,
  right: Future<x, a>
): Future<x, a> => {
  const self = Select.pool.new(Select)
  self.left = left
  self.right = right
  return self
}
