/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test map3 succeed", async test => {
  const task = Task.map3(
    (a, b, c) => a + b + c,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5)
  )

  const value = await ThreadPool.promise(task)
  test.isEqual(value, 12)
})

test("test map3 fail 1st", async test => {
  const task = Task.map3(
    (a, b, c) => a + b + c,
    Task.fail("first fail"),
    Task.succeed(4),
    Task.succeed(5)
  )

  try {
    const value = await ThreadPool.promise(task)

    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})

test("test map3 fail 2nd", async test => {
  const task = Task.map3(
    (a, b, c) => a + b + c,
    Task.succeed(3),
    Task.fail("second fail"),
    Task.succeed(5)
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "second fail")
  }
})

test("test map3 fail 3rd", async test => {
  const task = Task.map3(
    (a, b, c) => a + b + c,
    Task.succeed(3),
    Task.succeed(4),
    Task.fail("third fail")
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "third fail")
  }
})

test("test map3 fail all", async test => {
  const task = Task.map3(
    (a, b, c) => a + b + c,
    Task.fail("first fail"),
    Task.fail("second fail"),
    Task.fail("thrid fail")
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})
