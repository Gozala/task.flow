/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test succeed", async test => {
  const task = Task.succeed(5)
  const value = await ThreadPool.promise(task)

  test.isEqual(value, 5)
})
