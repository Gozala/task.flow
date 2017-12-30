/* @flow */

import Task from "../"
import test from "blue-tape"

test("test map2 succeed", async test => {
  const task = Task.map2((a, b) => a + b, Task.succeed(3), Task.succeed(4))
  const value = await Task.toPromise(task)
  test.isEqual(value, 7)
})

test("test map2 fail 1st", async test => {
  const task = Task.map2(
    (a, b) => a + b,
    Task.fail("first fail"),
    Task.succeed(4)
  )

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})

test("test map2 fail 2nd", async test => {
  const task = Task.map2(
    (a, b) => a + b,
    Task.succeed(4),
    Task.fail("second fail")
  )

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, "second fail")
  }
})

test("test map2 fail both", async test => {
  const task = Task.map2(
    (a, b) => a + b,
    Task.fail("first fail"),
    Task.fail("second fail")
  )

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})
