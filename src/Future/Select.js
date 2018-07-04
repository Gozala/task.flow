// @flow

import type { Future, Poll } from "@task.flow/type"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

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
    if (left != null) {
      this.right.abort()
      this.delete()
      return left
    } else {
      const right = this.right.poll()
      if (right != null) {
        this.left.abort()
        this.delete()
        return right
      } else {
        return null
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
