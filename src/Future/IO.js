// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Future } from "./Future"
import type { Poll } from "../Poll"
import type { Task } from "../Task"
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
  threadID: ThreadID
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
    delete this.threadID
    delete this.canceler
    delete this.cancel
    delete this.state
    IO.pool.delete(this)
  }
  succeed(value: a): void {
    const { thread, threadID, state } = this
    if (thread != null && state == null) {
      this.state = succeed(value)
      thread.notify(threadID)
    }
  }
  fail(reason: x): void {
    const { thread, threadID, state } = this
    if (thread != null && state == null) {
      this.state = fail(reason)
      thread.notify(threadID)
    }
  }
  poll(): Poll<x, a> {
    const { state, threadID } = this
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
  thread: Thread,
  threadID: ThreadID
): Future<x, a> => {
  const io = new IO() //.pool.new(IO)
  io.state = null
  io.thread = thread
  io.threadID = threadID
  io.cancel = cancel
  io.canceler = execute(io.succeed, io.fail)
  return io
}
