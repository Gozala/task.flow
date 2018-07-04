// @flow

import type { Thread, Future, Poll, Task } from "task.type.flow"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

export interface Handler<x, a, b> {
  handle(a): Task<x, b>;
}

class Then<x, a, b> implements Future<x, b> {
  static pool: Pool<Then<x, a, b>> = new Pool()
  handler: Handler<x, a, b>
  left: Future<x, a>
  right: null | Future<x, b>
  thread: Thread
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    this.abort()
    delete this.handler
    delete this.left
    delete this.right
    delete this.thread
    Then.pool.delete(this)
  }
  poll(): Poll<x, b> {
    if (this.right) {
      const right = this.right.poll()
      if (right != null) {
        this.delete()
        return right
      } else {
        return null
      }
    } else {
      const left = this.left.poll()
      if (left != null) {
        if (left.isOk) {
          this.right = this.handler.handle(left.value).spawn(this.thread)

          const right = this.right.poll()
          if (right != null) {
            this.delete()
            return right
          } else {
            return null
          }
        } else {
          this.delete()
          return left
        }
      } else {
        return null
      }
    }
  }
  abort() {
    if (this.right) {
      this.right.abort()
    } else if (this.left) {
      this.left.abort()
    }
  }
}

export default <x, a, b>(
  task: Task<x, a>,
  handler: Handler<x, a, b>,
  thread: Thread
): Then<x, a, b> => {
  const self = Then.pool.new(Then)
  self.thread = thread
  self.handler = handler
  self.left = task.spawn(thread)
  return self
}
