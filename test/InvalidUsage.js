/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test if fail called twice second call is ignored", async test => {
  const task = Task.io((succeed, fail) => {
    fail(Error("Boom"))
    fail(Error("BagaBoom"))
  })

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.ok(error instanceof Error)
    test.isEqual(error.message, "Boom")
  }
})

test("test if fail called twice second (delayed) call is ignored", async test => {
  // This test case illustrates potential bug that can arise due to recycling of
  // Future.IO instances. What happens is that Future.IO will be recycled and
  // will represent different task, when `fail` is called second time around
  // which in turn will cause error as new task will fail even though it supposed
  // to succeed.
  const remote = {}

  const task = Task.io((succeed, fail) => {
    fail(Error("Boom"))
    remote.succeed1 = succeed
    remote.fail1 = fail
  })

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.ok(error instanceof Error)
    test.isEqual(error.message, "Boom")
  }

  const task2 = Task.io((succeed, fail) => {
    remote.succeed2 = succeed
    remote.fail2 = fail
  })

  const promise = ThreadPool.promise(task2)

  remote.fail1(Error("BagaBoom"))
  remote.succeed2("fine")

  try {
    const value = await promise
    test.isEqual(value, "fine")
  } catch (error) {
    test.fail("Shuld have passed")
  }
})

test("test if succeeds called twice second call is ignored", async test => {
  const task = Task.io((succeed, fail) => {
    succeed({ beep: "bop", bar: "baz" })
    succeed(5)
  })
  const value = await ThreadPool.promise(task)
  test.isEquivalent(value, { beep: "bop", bar: "baz" })
})

test("test task succeed, then fail is called later is ignored", async test => {
  const task = Task.io((succeed, fail) => {
    succeed({ beep: "bop", bar: "baz" })
    fail(5)
  })

  const value = await ThreadPool.promise(task)
  test.isEquivalent(value, { beep: "bop", bar: "baz" })
})

test("test task fail, then succeed is called later is ignored", async test => {
  const task = Task.io((succeed, fail) => {
    fail(Error("Boom"))
    succeed({ data: "text" })
  })
  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.ok(error instanceof Error)
    test.isEqual(error.message, "Boom")
  }
})
