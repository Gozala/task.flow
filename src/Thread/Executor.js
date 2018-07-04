// @flow

import type { ThreadID, Thread } from "../Thread"
import type { Future } from "../Future"
import type { Task } from "../Task"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

export default class Executor implements Thread {
  static pool: Pool<Executor> = new Pool()
  isParked: boolean
  future: Future<empty, void>
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.future
    Executor.pool.delete(this)
  }
  perform(task: Task<empty, void>): void {
    this.future = task.spawn(this, this.lifecycle)
    this.work()
  }
  static new(): Executor {
    return Executor.pool.new(Executor)
  }
  static spawn(task: Task<empty, void>): void {
    Executor.new().perform(task)
  }
  static promise<x, a>(task: Task<x, a>): Promise<a> {
    return new Promise((resolve, reject) =>
      Executor.spawn(task.map(resolve).recover(reject))
    )
  }
  kill() {
    this.future.abort()
    this.delete()
  }
  work() {
    const result = this.future.poll()
    if (result != null) {
      this.delete()
    } else {
      this.isParked = true
    }
  }
  notify(id: ThreadID): void {
    if (this.lifecycle === id) {
      this.unpark()
    } else {
      throw Error("Thread is no longer avaliable")
    }
  }
  async unpark() {
    if (this.isParked) {
      this.isParked = false
      await Promise.resolve()
      this.work()
    }
  }
}
