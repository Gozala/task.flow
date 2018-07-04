// @flow

import type { Thread, Park, Task, Future, Poll } from "@task.flow/type"
import { succeed, fail } from "../Poll"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

export type Execute<x, a, handle> = (
  succeed: (a) => void,
  fail: (x) => void
) => handle
export type Cancel<handle> = handle => void

class IO<x, a, handle> implements Future<x, a> {
  static pool: Pool<IO<x, a, handle>> = new Pool()
  canceler: handle
  cancel: Cancel<handle>
  thread: Thread
  park: Park
  lifecycle: Lifecycle
  succeed: a => void
  fail: x => void
  state: Poll<x, a>
  constructor() {
    this.succeed = this.succeed.bind(this)
    this.fail = this.fail.bind(this)
  }
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.thread
    delete this.park
    delete this.canceler
    delete this.cancel
    delete this.state
    IO.pool.delete(this)
  }
  succeed(value: a): void {
    const { thread, park, state } = this
    if (thread != null && state == null) {
      this.state = succeed(value)
      thread.unpark(park)
    }
  }
  fail(reason: x): void {
    const { thread, park, state } = this
    if (thread != null && state == null) {
      this.state = fail(reason)
      thread.unpark(park)
    }
  }
  poll(): Poll<x, a> {
    const { state, park } = this
    if (state != null) {
      this.delete()
      return state
    } else {
      return null
    }
  }
  abort() {
    const { state, cancel, canceler } = this
    if (state != null) {
      this.delete()
      cancel(canceler)
    }
  }
}

export default <x, a, handle>(
  execute: Execute<x, a, handle>,
  cancel: Cancel<handle>,
  thread: Thread
): Future<x, a> => {
  const io = new IO()
  io.state = null
  io.thread = thread
  io.park = thread.park()
  io.cancel = cancel
  io.canceler = execute(io.succeed, io.fail)
  return io
}
