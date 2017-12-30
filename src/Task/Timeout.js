// @flow
import type { ThreadID, Thread } from "../Thread"
import type { Future } from "../Future"
import type { Task } from "./Task"
import Pool from "../Pool"
import Kernel from "./Kernel"
import type { Lifecycle } from "../Pool"
import type { Succeed, Poll } from "../Poll"
import { nil, wait } from "../Poll"

class Timeout extends Kernel<empty, void> {
  time: number
  constructor(time: number) {
    super()
    this.time = time
  }
  spawn(thread: Thread, id: ThreadID): Future<empty, void> {
    const timer = TimeoutFuture.pool.new(TimeoutFuture)
    timer.result = null
    timer.id = setTimeout(TimeoutFuture.timeout, this.time, thread, id, timer)
    return timer
  }
}

class TimeoutFuture implements Future<empty, void> {
  static pool: Pool<TimeoutFuture> = new Pool()
  result: ?Succeed<void> = null
  id: number
  lifecycle: Lifecycle
  static timeout(thread: Thread, id: ThreadID, timer: TimeoutFuture) {
    timer.result = nil
    thread.notify(id)
  }
  abort() {
    clearTimeout(this.id)
  }
  poll(): Poll<empty, void> {
    const { result } = this
    if (result) {
      this.delete()
      return result
    } else {
      return wait
    }
  }
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    this.result = null
    this.id = 0
    TimeoutFuture.pool.delete(this)
  }
}

export const timeout = (time: number): Task<empty, void> => new Timeout(time)

export default timeout
