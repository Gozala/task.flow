/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test map4 succeed", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6)
  )

  const value = await ThreadPool.promise(task)
  test.isEqual(value, 18)
})

test("test map4 fail 1st", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.fail("first fail"),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6)
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})

test("test map4 fail 2nd", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.succeed(3),
    Task.fail("second fail"),
    Task.succeed(5),
    Task.succeed(6)
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "second fail")
  }
})

test("test map4 fail 3rd", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.succeed(3),
    Task.succeed(4),
    Task.fail("third fail"),
    Task.succeed(6)
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "third fail")
  }
})

test("test map4 fail 4th", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.fail("fourth fail")
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "fourth fail")
  }
})

test("test map4 fail all", async test => {
  const task = Task.map4(
    (a, b, c, d) => a + b + c + d,
    Task.fail("first fail"),
    Task.fail("second fail"),
    Task.fail("thrid fail"),
    Task.fail("fourth fail")
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})
