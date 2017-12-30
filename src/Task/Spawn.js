// @flow

import type { ThreadID, Thread } from "../Thread"
import type { Future } from "../Future"
import type { Task } from "./Task"
import { succeed, Kernel } from "./Kernel"
import Pool from "../Pool"
import type { Lifecycle } from "../Pool"
import type { Poll } from "../Poll"
import { wait } from "../Poll"

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
  spawn(thread: Thread, id: ThreadID): Future<empty, void> {
    const future = SpawnFuture.pool.new(SpawnFuture)
    return future
  }
}

class SpawnFuture implements Future<empty, void> {
  static pool: Pool<SpawnFuture> = new Pool()
  lifecycle: Lifecycle
  abort() {}
  poll(): Poll<empty, void> {
    return wait
  }
  recycle(lifecycle: Lifecycle) {
    this.lifecycle = lifecycle
  }
  delete() {
    SpawnFuture.pool.delete(this)
  }
}
