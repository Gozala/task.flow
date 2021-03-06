// @flow

import type { Task, Future, Thread, Poll } from "@task.flow/type"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

export interface Handler<x, y, a> {
  handle(x): Task<y, a>;
}

class Catch<x, y, a> implements Future<y, a> {
  static pool: Pool<Catch<x, y, a>> = new Pool()
  handler: Handler<x, y, a>
  left: Future<x, a>
  right: null | Future<y, a>
  thread: Thread
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  poll(): Poll<y, a> {
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
          this.delete()
          return left
        } else {
          this.right = this.handler.handle(left.error).spawn(this.thread)

          const right = this.right.poll()
          if (right != null) {
            this.delete()
            return right
          } else {
            return null
          }
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
  delete() {
    this.abort()
    delete this.handler
    delete this.thread
    delete this.lifecycle
    Catch.pool.delete(this)
  }
}

export default <x, y, a>(
  task: Task<x, a>,
  handler: Handler<x, y, a>,
  thread: Thread
): Future<y, a> => {
  const self = Catch.pool.new(Catch)
  self.handler = handler
  self.thread = thread
  self.right = null
  self.left = task.spawn(thread)
  return self
}
