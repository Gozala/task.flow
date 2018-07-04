// @flow
import type { Thread, Park, Future, Task, Succeed, Poll } from "@task.flow/type"
import Pool from "pool.flow"
import Kernel from "./Kernel"
import type { Lifecycle } from "pool.flow"
import { nil } from "../Poll"

class Timeout extends Kernel<empty, void> {
  time: number
  constructor(time: number) {
    super()
    this.time = time
  }
  spawn(thread: Thread): Future<empty, void> {
    const timer = TimeoutFuture.pool.new(TimeoutFuture)
    timer.result = null
    timer.id = setTimeout(
      TimeoutFuture.timeout,
      this.time,
      thread,
      thread.park(),
      timer
    )
    return timer
  }
}

class TimeoutFuture implements Future<empty, void> {
  static pool: Pool<TimeoutFuture> = new Pool()
  result: ?Succeed<void> = null
  id: TimeoutID
  lifecycle: Lifecycle
  static timeout(thread: Thread, park: Park, timer: TimeoutFuture) {
    timer.result = nil
    thread.unpark(park)
  }
  abort() {
    clearTimeout(this.id)
  }
  poll(): Poll<empty, void> {
    const { result } = this
    if (result != null) {
      this.delete()
      return result
    } else {
      return null
    }
  }
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    this.result = null
    delete this.id
    TimeoutFuture.pool.delete(this)
  }
}

export const timeout = (time: number): Task<empty, void> => new Timeout(time)

export default timeout
