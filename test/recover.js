/* @flow */

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test("test fail(x).recover", async test => {
  const task = Task.fail("Boom").recover(x => `!${x}`)

  try {
    const value = await ThreadPool.promise(task)
    test.equals(value, "!Boom")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test succeed(x).recover", async test => {
  const task = Task.succeed(5).recover(x => {
    test.fail("recover should not run unless task failed")
    return x
  })

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, 5)
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test fail(x).recover(a).recover(b)", async test => {
  const task = Task.fail("Boom")
    .recover(x => `${x}!`)
    .recover(x => `${x}?`)

  try {
    const value = await ThreadPool.promise(task)
    test.equal(value, "Boom!")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.fail(x).recover", async test => {
  const task = Task.io((succeed, fail) => fail("Boom")).recover(x => `!${x}`)

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, "!Boom")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.succeed(x).recover", async test => {
  const task = Task.io((succeed, fail) => succeed(5)).recover(x => {
    test.fail("recover should not run unless task failed")
    return x
  })

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, 5)
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.fail(x).recover(a).recover(b)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom"))
    .recover(x => `${x}!`)
    .recover(x => `${x}?`)

  try {
    const value = await ThreadPool.promise(task)
    test.equal(value, "Boom!")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test succeed(x).recover", async test => {
  const task = Task.succeed(5).recover(x => {
    test.fail("recover should not run unless task failed")
    return x
  })

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, 5)
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test fail(x).recover(a).recover(b)", async test => {
  const task = Task.fail("Boom")
    .recover(x => `${x}!`)
    .recover(x => `${x}?`)

  try {
    const value = await ThreadPool.promise(task)
    test.equal(value, "Boom!")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.fail(x).recover", async test => {
  const task = Task.io((succeed, fail) => fail("Boom")).recover(x => `!${x}`)

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, "!Boom")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.succeed(x).recover", async test => {
  const task = Task.io((succeed, fail) => succeed(5)).recover(x => {
    test.fail("recover should not run unless task failed")
    return x
  })

  try {
    const value = await ThreadPool.promise(task)
    test.isEqual(value, 5)
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})

test("test io.fail(x).recover(a).recover(b)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom"))
    .recover(x => `${x}!`)
    .recover(x => `${x}?`)

  try {
    const value = await ThreadPool.promise(task)
    test.equal(value, "Boom!")
  } catch (error) {
    test.fail(`Should have succeed ${error}`)
  }
})
