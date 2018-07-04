// @flow

import type { Thread, Park, Future, Task, Poll } from "@task.flow/type"
import { succeed, Kernel } from "./Kernel"
import Pool from "pool.flow"
import type { Lifecycle } from "pool.flow"

class Process {
  kill(): Task<empty, void> {
    return succeed()
  }
}

class Spawn extends Kernel<empty, void> {
  task: Task<empty, void>
  constructor(task: Task<empty, void>) {
    super()
    this.task = task
  }
  spawn(thread: Thread): Future<empty, void> {
    const future = SpawnFuture.pool.new(SpawnFuture)
    return future
  }
}

class SpawnFuture implements Future<empty, void> {
  static pool: Pool<SpawnFuture> = new Pool()
  lifecycle: Lifecycle
  abort() {}
  poll(): Poll<empty, void> {
    return null
  }
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    SpawnFuture.pool.delete(this)
  }
}
