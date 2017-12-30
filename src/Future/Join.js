// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Future } from "./Future"
import type { Poll } from "../Poll"
import { wait, succeed } from "../Poll"
import Pool from "../Pool"
import type { Lifecycle } from "../Pool"

class Join<x, a, b> implements Future<x, [a, b]> {
  static pool: Pool<Join<x, a, b>> = new Pool()
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
    if (this.leftResult.isReady === false) {
      this.left.abort()
    }

    if (this.rightResult.isReady === false) {
      this.right.abort()
    }
  }
  poll(): Poll<x, [a, b]> {
    const { leftResult, rightResult, left, right } = this

    if (leftResult.isReady === true) {
      if (leftResult.isOk === true) {
        if (rightResult.isReady === true) {
          if (rightResult.isOk === true) {
            this.delete()
            return succeed([leftResult.value, rightResult.value])
          } else {
            this.delete()
            return rightResult
          }
        } else {
          const result = this.right.poll()
          if (result.isReady === false) {
            return wait
          } else {
            if (result.isOk === true) {
              this.delete()
              return succeed([leftResult.value, result.value])
            } else {
              this.delete()
              return result
            }
          }
        }
      } else {
        this.delete()
        return leftResult
      }
    } else {
      const result = left.poll()
      this.leftResult = result
      if (result.isReady === true) {
        return this.poll()
      } else {
        return wait
      }
    }
  }
}

export default <x, a, b>(
  left: Future<x, a>,
  right: Future<x, b>
): Future<x, [a, b]> => {
  const self = Join.pool.new(Join)
  self.left = left
  self.right = right
  self.leftResult = wait
  self.rightResult = wait
  return self
}
