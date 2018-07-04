/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("map succeed", async test => {
  const task = Task.succeed(6)
    .map(x => x + 10)
    .map(x => x + 1)

  const value = await ThreadPool.promise(task)
  test.isEqual(value, 17)
})

test("test map fail", async test => {
  const task = Task.fail("Boom!")
    .map(x => x + 10)
    .map(x => x + 1)

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should not succeed", value)
  } catch (error) {
    test.isEqual(error, "Boom!")
  }
})

test("test task success mapped twice", async test => {
  const task = Task.io((succeed, fail) => {
    succeed(4)
  })
    .map(x => x + 10)
    .map(x => x + 1)
  const value = await ThreadPool.promise(task)

  test.isEqual(value, 15)
})

test("test task failure mapped twice", async test => {
  const task = Task.io((succeed, fail) => {
    fail("Boom!")
  })
    .map(x => x + 10)
    .map(x => x + 1)

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should not succeed", value)
  } catch (error) {
    test.isEqual(error, "Boom!")
  }
})

test("test task map via function", async test => {
  const task1 = Task.io((succeed, fail) => {
    succeed(4)
  })
  const task2 = Task.map(x => x + 10, task1)
  const task3 = Task.map(x => x + 1, task2)

  const value = await ThreadPool.promise(task3)
  test.isEqual(value, 15)
})
