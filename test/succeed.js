/* @flow */

import Task from "../"
import Thread from "../lib/Thread/Executor"
import test from "blue-tape"

test("test succeed", async test => {
  const task = Task.succeed(5)
  const value = await Thread.promise(task)

  test.isEqual(value, 5)
})
