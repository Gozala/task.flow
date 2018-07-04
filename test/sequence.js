// @flow

import Task from "../"
import Thread from "../lib/Thread/Executor"
import test from "blue-tape"

test("test sequence", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3)
  ])

  try {
    const value = await Thread.promise(task)
    test.isEquivalent(value, [1, 2, 3])
  } catch (error) {
    test.fail("Should succeeded")
  }
})

test("test sequence fail first", async test => {
  const task = Task.sequence([
    Task.fail("first"),
    Task.succeed(2),
    Task.succeed(3)
  ])

  try {
    const value = await Thread.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.equal(error, "first")
  }
})

test("test sequence fail second", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.fail("second"),
    Task.succeed(3)
  ])

  try {
    const value = await Thread.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.equal(error, "second")
  }
})

test("test sequence fail third", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.fail("third"),
    Task.succeed(3)
  ])

  try {
    const value = await Thread.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.equal(error, "third")
  }
})

test("test sequence fail second & third", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.fail("second"),
    Task.fail("third")
  ])

  try {
    const value = await Thread.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.equal(error, "second")
  }
})

test("test sequence of 12", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6),
    Task.succeed(7),
    Task.succeed(8),
    Task.succeed(9),
    Task.succeed(10),
    Task.succeed(11),
    Task.succeed(12)
  ])

  try {
    const value = await Thread.promise(task)
    test.isEquivalent(value, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  } catch (error) {
    test.fail("Should succeeded")
  }
})

test("test sequence of 12 with failed", async test => {
  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.fail("sixth"),
    Task.succeed(7),
    Task.succeed(8),
    Task.fail("nineth"),
    Task.succeed(10),
    Task.succeed(11),
    Task.succeed(12)
  ])

  try {
    const value = await Thread.promise(task)
    test.fail("Should have failed", value)
  } catch (error) {
    test.equal(error, "sixth")
  }
})
