/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test suceeded(x).chain", async test => {
  const task = Task.succeed(5).chain(x => Task.succeed(x + 10))

  const value = await ThreadPool.promise(task)

  test.isEqual(value, 15)
})

test("test failed(x).chain", async test => {
  const task = Task.fail("Boom").chain(x => Task.succeed(x + 10))

  try {
    const value = await ThreadPool.promise(task)

    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "Boom")
  }
})

test("test return fail(x) from .chain", async test => {
  const task = Task.succeed(5).chain(x => Task.fail(x + 10))

  try {
    const value = await ThreadPool.promise(task)

    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, 15)
  }
})

test("test return fail() then succeed() from .chain", async test => {
  const task = Task.succeed(5)
    .chain(x => Task.fail(x + 10))
    .chain(x => Task.succeed(x + 10))

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, 15)
  }
})

test("test fail(e).chain(f).chain(g).chain(h)", async test => {
  const double = x => x * 2
  const task = Task.fail("Boom")
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "Boom")
  }
})

test("test succeed(a).chain(f).chain(g).chain(h)", async test => {
  const double = x => x * 2
  const task = Task.succeed(2)
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const value = await ThreadPool.promise(task)

  test.isEqual(value, 16)
})

test("test io.suceeded(x).chain", async test => {
  const task = Task.io((succeed, fail) => succeed(5)).chain(x =>
    Task.succeed(x + 10)
  )
  const value = await ThreadPool.promise(task)

  test.isEqual(value, 15)
})

test("test io.failed(x).chain", async test => {
  const task = Task.io((succeed, fail) => fail("Boom")).chain(x =>
    Task.succeed(x + 10)
  )

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "Boom")
  }
})

test("test io return fail(x) from .chain", async test => {
  const task = Task.io((succeed, fail) => succeed(5)).chain(x =>
    Task.fail(x + 10)
  )

  try {
    const value = await ThreadPool.promise(task)

    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, 15)
  }
})

test("test io return fail() then succeed() from .chain", async test => {
  const task = Task.io((succeed, fail) => succeed(5))
    .chain(x => Task.fail(x + 10))
    .chain(x => Task.succeed(x + 10))

  try {
    const value = await ThreadPool.promise(task)

    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, 15)
  }
})

test("test io fail(e).chain(f).chain(g).chain(h)", async test => {
  const double = x => x * 2
  const task = Task.io((succeed, fail) => fail("Boom"))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  try {
    const value = await ThreadPool.promise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.isEqual(error, "Boom")
  }
})

test("test io succeed(a).chain(f).chain(g).chain(h)", async test => {
  const double = x => x * 2
  const task = Task.io((succeed, fail) => succeed(2))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const value = await ThreadPool.promise(task)

  test.isEqual(value, 16)
})
