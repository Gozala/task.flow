// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Poll } from "../Poll"
import type { Future } from "./Future"
import type { Task } from "../Task"
import Pool from "../Pool"
import type { Lifecycle } from "../Pool"

export interface Handler<x, a, b> {
  handle(a): Task<x, b>;
}

class Then<x, a, b> implements Future<x, b> {
  static pool: Pool<Then<x, a, b>> = new Pool()
  handler: Handler<x, a, b>
  left: Future<x, a>
  right: null | Future<x, b>
  thread: Thread
  threadID: ThreadID
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
    delete this.threadID
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
          this.right = this.handler
            .handle(left.value)
            .spawn(this.thread, this.threadID)

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
  thread: Thread,
  threadID: ThreadID
): Then<x, a, b> => {
  const self = Then.pool.new(Then)
  self.thread = thread
  self.threadID = threadID
  self.handler = handler
  self.left = task.spawn(thread, threadID)
  return self
}
