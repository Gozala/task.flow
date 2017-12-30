/* @flow */

import Task from "../"
import test from "blue-tape"

test("test fail", async test => {
  const task = Task.fail(5)
  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, 5)
  }
})
