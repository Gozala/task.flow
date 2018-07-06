/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test map5 succeed", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6),
    Task.succeed(7)
  )

  const value = await ThreadPool.promise(task)
  test.isEqual(value, 25)
})

test("test map5 fail 1st", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.fail("first fail"),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6),
    Task.succeed(7)
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})

test("test map5 fail 2nd", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.succeed(3),
    Task.fail("second fail"),
    Task.succeed(5),
    Task.succeed(6),
    Task.succeed(7)
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "second fail")
  }
})

test("test map5 fail 3rd", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.succeed(3),
    Task.succeed(4),
    Task.fail("third fail"),
    Task.succeed(6),
    Task.succeed(7)
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "third fail")
  }
})

test("test map5 fail 4th", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.fail("fourth fail"),
    Task.succeed(7)
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "fourth fail")
  }
})

test("test map5 fail 5th", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6),
    Task.fail("fifth fail")
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "fifth fail")
  }
})

test("test map5 fail all", async test => {
  const task = Task.map5(
    (a, b, c, d, e) => a + b + c + d + e,
    Task.fail("first fail"),
    Task.fail("second fail"),
    Task.fail("thrid fail"),
    Task.fail("fourth fail"),
    Task.fail("fifth fail")
  )
  try {
    const value = await ThreadPool.promise(task)
    test.fail(`Should have failed ${value}`)
  } catch (error) {
    test.isEqual(error, "first fail")
  }
})
