/* @flow */

import Task from "../"
import test from "blue-tape"

test("test succeed", async test => {
  const task = Task.succeed(5)
  const value = await Task.toPromise(task)

  test.isEqual(value, 5)
})
