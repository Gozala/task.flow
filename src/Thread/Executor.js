// @flow

import type { Task, Future, Thread, Park } from "task.type.flow"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

export default class Executor implements Thread {
  static pool: Pool<Executor> = new Pool()
  isParked: boolean
  future: Future<empty, void>
  lifecycle: Park
  recycle(lifecycle: Park) {
    this.lifecycle = lifecycle
  }
  delete() {
    delete this.future
    Executor.pool.delete(this)
  }
  perform(task: Task<empty, void>): void {
    this.future = task.spawn(this)
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
  park(): Park {
    return this.lifecycle
  }
  unpark(park: Park): void {
    if (this.lifecycle === park) {
      this.awake()
    } else {
      throw Error("Thread is no longer avaliable")
    }
  }
  async awake() {
    if (this.isParked) {
      this.isParked = false
      await Promise.resolve()
      this.work()
    }
  }
}
