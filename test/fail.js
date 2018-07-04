/* @flow */

import Task from "../"
import test from "blue-tape"
import ThreadPool from "@task.flow/thread-pool"

test("test fail", async test => {
  const task = Task.fail(5)
  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, 5)
  }
})
