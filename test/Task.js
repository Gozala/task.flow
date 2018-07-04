// @flow

import Task from "../"
import test from "blue-tape"

test("test exports", async test => {
  test.ok(isFunction(Task.io), "exports io function")
  test.ok(isFunction(Task.succeed), "exports succeed function")
  test.ok(isFunction(Task.fail), "exports fail function")
  test.ok(isFunction(Task.chain), "exports chain function")
  test.ok(isFunction(Task.map), "exports map function")
  test.ok(isFunction(Task.capture), "exports capture function")
  test.ok(isFunction(Task.format), "exports format function")
  test.ok(isFunction(Task.recover), "exports recover function")
  test.ok(isFunction(Task.map2), "exports map2 function")
  test.ok(isFunction(Task.map3), "exports map3 function")
  test.ok(isFunction(Task.map4), "exports map4 function")
  test.ok(isFunction(Task.map5), "exports map5 function")
  test.ok(isFunction(Task.sequence), "exports sequence function")
})

test("test task instance API", async test => {
  testSucceedAPI(test, Task.succeed(1), 1)
  testFailAPI(test, Task.fail(2), 2)
  testFutureAPI(test, Task.io((succeed, fail) => succeed(4)))
})

const testFutureAPI = (test, task) => {
  test.ok(isObject(task), "task is an object")
  test.ok(isFunction(task.chain), "task.chain is method")
  test.ok(isFunction(task.map), "task.map is method")
  test.ok(isFunction(task.capture), "task.capture is method")
  test.ok(isFunction(task.format), "task.format is method")
  test.ok(isFunction(task.recover), "task.recover is method")
  test.ok(isFunction(task.select), "task.select is method")
  test.ok(isFunction(task.couple), "task.couple is method")
}

const testSucceedAPI = (test, task, value) => {
  test.equal(task.value, value, "succeed(value).value === value")
  testFutureAPI(test, task)
}

const testFailAPI = (test, task, error) => {
  test.equal(task.error, error, "succeed(error).error === error")
  testFutureAPI(test, task)
}

const isFunction = value => typeof value === "function"

const isObject = value => value != null && typeof value === "object"
