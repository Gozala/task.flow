/* @flow */

import Task from '../'
import test from 'tape'

test('test Process class', test => {
  const process = Task.fork(Task.succeed(true), _ => {}, _ => {})
  const Process = process.constructor

  test.ok(isClass(Process))

  test.equal(Task.kill, Process.kill, 'Task.kill is Process.kill')
  test.equal(Task.fork, Process.fork, 'Task.fork is Process.fork')
  test.equal(Task.spawn, Process.spawn, 'Task.spawn is Process.spawn')
  test.equal(Task.send, Process.send, 'Task.send is Process.send')
  test.equal(Task.receive, Process.receive, 'Task.receive is Process.receive')
  test.equal(Task.isProcess, Process.isProcess, 'Task.receive is Process.receive')

  const prototype = Process.prototype
  test.ok(isFunction(prototype.send), '.send is method')
  test.ok(isFunction(prototype.kill), '.kill is method')

  test.ok(Task.isProcess(process))

  test.end()
})

const isFunction =
  value =>
  typeof (value) === 'function'

const isObject =
  value =>
  value != null && typeof (value) === 'object'

const isClass =
  value =>
  isFunction(value) && isObject(value.prototype)
