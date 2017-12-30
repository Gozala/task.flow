// @flow

import type { ThreadID, Thread } from "../Thread"
import type { Future } from "../Future"
import type { Task } from "../Task"
import Pool from "../Pool"
import type { Lifecycle } from "../Pool"
import { succeed } from "../Task/Kernel"

export default class Executor<x, a> implements Thread {
  static pool: Pool<Executor<x, a>> = new Pool()
  isParked: boolean
  future: Future<x, a>
  lifecycle: Lifecycle
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.future
    Executor.pool.delete(this)
  }
  static spawn(task: Task<empty, void>): void {
    const fork = Executor.pool.new(Executor)
    fork.future = task.spawn(fork, fork.lifecycle)
    fork.work()
  }
  static toPromise<x, a>(task: Task<x, a>): Promise<a> {
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
