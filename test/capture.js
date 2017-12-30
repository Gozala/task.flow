// @flow

import Task from "../"
import test from "blue-tape"

test("test fail(x).capture(succeed)", async test => {
  const task = Task.fail("Boom").capture(x => Task.succeed(`!${x}`))
  const value = await Task.toPromise(task)
  test.equal(value, "!Boom")
})

test("test succeed(x).capture", async test => {
  const task = Task.succeed(5).capture(x => {
    test.fail("Catpure should not run unless task failed")
    return Task.succeed(-5)
  })
  const value = await Task.toPromise(task)

  test.equal(value, 5)
})

test("test fail(x).capture(fail).capture(fail)", async test => {
  const task = Task.fail("Boom!")
    .capture(x => Task.fail(`${x}!`))
    .capture(x => Task.fail(`${x}!`))

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.equal(error, "Boom!!!")
  }
})

test("test fail(x).capture(fail).capture(succeed)", async test => {
  const task = Task.fail("Boom!")
    .capture(x => Task.fail(`${x}!`))
    .capture(x => Task.succeed(`!${x}`))

  const value = await Task.toPromise(task)
  test.equal(value, "!Boom!!")
})

test("test fail(x).capture(succeed).capture(fail)", async test => {
  const task = Task.fail("Boom!")
    .capture(x => Task.succeed(`!${x}`))
    .capture(x => Task.fail(`${x}!`))

  const value = await Task.toPromise(task)
  test.equal(value, "!Boom!")
})

test("test io.fail(x).capture(succeed)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom")).capture(x =>
    Task.succeed(`!${x}`)
  )

  const value = await Task.toPromise(task)

  test.isEqual(value, "!Boom")
})

test("test io.succeed(x).capture", async test => {
  const task = Task.io((succeed, fail) => succeed(5)).capture(x => {
    test.fail("Catpure should not run unless task failed")
    return Task.succeed(-5)
  })

  const value = await Task.toPromise(task)
  test.isEqual(value, 5)
})

test("test io.fail(x).capture(fail).capture(fail)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom!"))
    .capture(x => Task.fail(`${x}!`))
    .capture(x => Task.fail(`${x}!`))

  try {
    const value = await Task.toPromise(task)
    test.fail("Should have failed")
  } catch (error) {
    test.equal(error, "Boom!!!")
  }
})

test("test io.fail(x).capture(fail).capture(succeed)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom!"))
    .capture(x => Task.fail(`${x}!`))
    .capture(x => Task.succeed(`!${x}`))

  const value = await Task.toPromise(task)

  test.equal(value, "!Boom!!")
})

test("test io.fail(x).capture(succeed).capture(fail)", async test => {
  const task = Task.io((succeed, fail) => fail("Boom!"))
    .capture(x => Task.succeed(`!${x}`))
    .capture(x => Task.fail(`${x}!`))

  const value = await Task.toPromise(task)
  test.equal(value, "!Boom!")
})
