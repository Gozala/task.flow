/* @flow */

import Task from "../"
import test from "blue-tape"

test("test succeed format", async test => {
  const task = Task.succeed("data").format(text => text.toUpperCase())
  const value = await Task.toPromise(task)

  test.isEqual(value, "data")
})

test("test fail format", async test => {
  const task = Task.fail("Oops").format(text => text.toUpperCase())

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, "OOPS")
  }
})

test("test io.succeed format", async test => {
  const task = Task.io(succeed => succeed("data")).format(text =>
    text.toUpperCase()
  )
  const value = await Task.toPromise(task)
  test.isEqual(value, "data")
})

test("test io.fail format", async test => {
  const task = Task.io((succeed, fail) => fail("Oops")).format(text =>
    text.toUpperCase()
  )
  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.isEqual(error, "OOPS")
  }
})
