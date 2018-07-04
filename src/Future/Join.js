// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Future } from "./Future"
import type { Poll } from "../Poll"
import { succeed } from "../Poll"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

class Join<x, a, b, ab> implements Future<x, ab> {
  static pool: Pool<Join<x, a, b, ab>> = new Pool()
  combine: (a, b) => ab
  left: Future<x, a>
  right: Future<x, b>
  leftResult: Poll<x, a>
  rightResult: Poll<x, b>
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    this.abort()
    delete this.leftResult
    delete this.rightResult
    delete this.left
    delete this.right
    Join.pool.delete(this)
  }
  abort() {
    if (this.leftResult != null) {
      this.left.abort()
    }

    if (this.rightResult != null) {
      this.right.abort()
    }
  }
  poll(): Poll<x, ab> {
    const { leftResult, rightResult, left, right, combine } = this

    if (leftResult != null && rightResult != null) {
      if (!leftResult.isOk) {
        return leftResult
      } else if (!rightResult.isOk) {
        return rightResult
      } else {
        this.delete()
        return succeed(combine(leftResult.value, rightResult.value))
      }
    } else if (leftResult != null) {
      if (!leftResult.isOk) {
        return leftResult
      } else {
        const rightResult = right.poll()
        this.rightResult = rightResult
        return rightResult ? this.poll() : null
      }
    } else if (rightResult != null) {
      if (!rightResult.isOk) {
        return rightResult
      } else {
        const leftResult = left.poll()
        this.leftResult = leftResult
        return leftResult ? this.poll() : null
      }
    } else {
      const leftResult = left.poll()
      const rightResult = right.poll()
      this.leftResult = leftResult
      this.rightResult = rightResult
      return leftResult || rightResult ? this.poll() : null
    }
  }
}

export default <x, a, b, ab>(
  combine: (a, b) => ab,
  left: Future<x, a>,
  right: Future<x, b>
): Future<x, ab> => {
  const self = Join.pool.new(Join)
  self.combine = combine
  self.left = left
  self.right = right
  self.leftResult = null
  self.rightResult = null
  return self
}
