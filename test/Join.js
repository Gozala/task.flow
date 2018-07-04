// @flow

import Task from "../"
import ThreadPool from "@task.flow/thread-pool"
import test from "blue-tape"

test(".couple succeed", async test => {
  const task = Task.succeed("hi").couple(Task.succeed(2))

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { ok: ["hi", 2] })
})

test(".couple fail#1", async test => {
  const task = Task.fail("hi").couple(Task.succeed(2))

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: "hi" })
})

test(".couple fail#2", async test => {
  const task = Task.succeed("hi").couple(Task.fail(2))

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: 2 })
})

test(".couple fail#1,2", async test => {
  const task = Task.fail("hi").couple(Task.fail(2))

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: "hi" })
})

test(".couple async fail#1,2", async test => {
  let driver1 = {}
  let driver2 = {}
  const task = Task.io((succeed, fail) => {
    driver1.fail = fail
  }).couple(
    Task.io((succeed, fail) => {
      driver2.fail = fail
    })
  )

  const promise = ThreadPool.promise(task).then(ok, error)

  driver2.fail("second")

  await sleep()
  driver1.fail("first")

  const result = await promise

  test.isEquivalent(result, { error: "second" })
})

test("Taks.join succeed", async test => {
  const task = Task.join((a, b) => [a, b], Task.succeed("hi"), Task.succeed(2))

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { ok: ["hi", 2] })
})

test("Task.join3 succeed", async test => {
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.succeed("hi"),
    Task.succeed(2),
    Task.succeed({ x: 1 })
  )
  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { ok: ["hi", 2, { x: 1 }] })
})

test("Task.join3 fail#1", async test => {
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.fail("hi"),
    Task.succeed(2),
    Task.succeed({ x: 1 })
  )

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: "hi" })
})

test("Task.join3 fail#2", async test => {
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.succeed("hi"),
    Task.fail(2),
    Task.succeed({ x: 1 })
  )

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: 2 })
})

test("Task.join3 fail#3", async test => {
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.succeed("hi"),
    Task.succeed(2),
    Task.fail({ x: 1 })
  )

  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { error: { x: 1 } })
})

test("Task.join3 async succeed", async test => {
  const [driver1, driver2, driver3] = [{}, {}, {}]
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.io((succeed, fail) => {
      driver1.succeed = succeed
      driver1.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver2.succeed = succeed
      driver2.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver3.succeed = succeed
      driver3.fail = fail
    })
  )

  const promise = ThreadPool.promise(task).then(ok, error)

  await sleep(5)
  driver2.succeed({ x: 2 })

  await sleep(5)
  driver1.succeed({ x: 1 })

  await sleep(3)
  driver3.succeed({ x: 3 })

  const result = await promise
  test.isEquivalent(result, { ok: [{ x: 1 }, { x: 2 }, { x: 3 }] })
})

test("Task.join3 async fail#3", async test => {
  const [driver1, driver2, driver3] = [{}, {}, {}]
  const task = Task.join3(
    (a, b, c) => [a, b, c],
    Task.io((succeed, fail) => {
      driver1.succeed = succeed
      driver1.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver2.succeed = succeed
      driver2.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver3.succeed = succeed
      driver3.fail = fail
    })
  )

  const promise = ThreadPool.promise(task)

  await sleep(10)
  driver2.succeed({ x: 2 })

  await sleep(5)
  driver1.succeed({ x: 1 })

  await sleep(4)
  driver3.fail({ x: 3 })

  const result = await promise.then(ok, error)

  test.isEquivalent(result, { error: { x: 3 } })
})

test("Task.join4 succeed", async test => {
  const task = Task.join4(
    (a, b, c, d) => [a, b, c, d],
    Task.succeed("hi"),
    Task.succeed(2),
    Task.succeed({ x: 1 }),
    Task.succeed(null)
  )
  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { ok: ["hi", 2, { x: 1 }, null] })
})

test("Task.join4 async succeed", async test => {
  const [driver1, driver2, driver3, driver4] = [{}, {}, {}, {}]
  const task = Task.join4(
    (a, b, c, d) => [a, b, c, d],
    Task.io((succeed, fail) => {
      driver1.succeed = succeed
      driver1.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver2.succeed = succeed
      driver2.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver3.succeed = succeed
      driver3.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver4.succeed = succeed
      driver4.fail = fail
    })
  )

  const promise = ThreadPool.promise(task).then(ok, error)

  await sleep(3)
  driver2.succeed({ x: 2 })

  await sleep(4)
  driver1.succeed({ x: 1 })

  await sleep(10)
  driver3.succeed({ x: 3 })

  await sleep(10)
  driver4.succeed({ x: 4 })

  const result = await promise
  test.isEquivalent(result, { ok: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }] })
})

test("Task.join5 succeed", async test => {
  const task = Task.join5(
    (a, b, c, d, e) => [a, b, c, d, e],
    Task.succeed("hi"),
    Task.succeed(2),
    Task.succeed({ x: 1 }),
    Task.succeed(null),
    Task.succeed(true)
  )
  const result = await ThreadPool.promise(task).then(ok, error)

  test.isEquivalent(result, { ok: ["hi", 2, { x: 1 }, null, true] })
})

test("Task.join5 async fail#3", async test => {
  const [driver1, driver2, driver3, driver4, driver5] = [{}, {}, {}, {}, {}]
  const task = Task.join5(
    (a, b, c) => [a, b, c],
    Task.io((succeed, fail) => {
      driver1.succeed = succeed
      driver1.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver2.succeed = succeed
      driver2.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver3.succeed = succeed
      driver3.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver4.succeed = succeed
      driver4.fail = fail
    }),
    Task.io((succeed, fail) => {
      driver5.succeed = succeed
      driver5.fail = fail
    })
  )

  const promise = ThreadPool.promise(task).then(ok, error)

  await sleep(10)
  driver2.succeed({ x: 2 })

  await sleep(3)
  driver5.succeed({ x: 5 })

  await sleep(5)
  driver1.succeed({ x: 1 })

  await sleep(4)
  driver3.fail({ x: 3 })

  await sleep(3)
  driver4.fail({ x: 4 })

  const result = await promise

  test.isEquivalent(result, { error: { x: 3 } })
})

const sleep = (time: number = 0) =>
  new Promise(resolve => setTimeout(resolve, time))

const ok = ok => ({ ok })
const error = error => ({ error })
