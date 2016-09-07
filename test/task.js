/* @flow */

import * as TaskModule from '../'
import test from 'tape'

test('test exports', test => {
  const exports = TaskModule
  test.ok(isClass(exports.Task), 'exports Task class')
  test.ok(isFunction(exports.task), 'exports task function')
  test.ok(isFunction(exports.fork), 'exports fork function')
  test.ok(isFunction(exports.kill), 'exports kill function')
  test.ok(isFunction(exports.isTask), 'exports isTask function')
  test.ok(isFunction(exports.isProcess), 'exports isProcess function')
  test.ok(isFunction(exports.succeed), 'exports succeed function')
  test.ok(isFunction(exports.fail), 'exports fail function')
  test.ok(isFunction(exports.spawn), 'exports spawn function')
  test.ok(isFunction(exports.sleep), 'exports sleep function')
  test.ok(isFunction(exports.requestAnimationFrame),
                    'exports requestAnimationFrame function')
  test.ok(isFunction(exports.chain), 'exports chain function')
  test.ok(isFunction(exports.map), 'exports map function')
  test.ok(isFunction(exports.capture), 'exports capture function')
  test.ok(isFunction(exports.format), 'exports format function')
  test.ok(isFunction(exports.recover), 'exports recover function')
  test.ok(isFunction(exports.map2), 'exports map2 function')
  test.ok(isFunction(exports.map3), 'exports map3 function')
  test.ok(isFunction(exports.map4), 'exports map4 function')
  test.ok(isFunction(exports.map5), 'exports map5 function')
  test.ok(isFunction(exports.sequence), 'exports sequence function')

  test.end()
})

test('test Task class', test => {
  const exports = TaskModule
  const {Task} = exports

  // Statics
  test.equal(Task.task, exports.task, 'Task.task is exports.task')
  test.equal(Task.fork, exports.fork, 'Task.fork is exports.fork')
  test.equal(Task.kill, exports.kill, 'Task.kill is exports.kill')
  test.equal(Task.isTask, exports.isTask, 'Task.isTask is exports.isTask')
  test.equal(Task.isProcess, exports.isProcess,
            'Task.isProcess is exports.isProcess')
  test.equal(Task.succeed, exports.succeed, 'Task.succeed is exports.succeed')
  test.equal(Task.fail, exports.fail, 'Task.fail is exports.fail')
  test.equal(Task.spawn, exports.spawn, 'Task.spawn is exports.spawn')
  test.equal(Task.sleep, exports.sleep, 'Task.sleep is exports.sleep')
  test.equal(Task.requestAnimationFrame, exports.requestAnimationFrame,
            'Task.requestAnimationFrame is exports.requestAnimationFrame')
  test.equal(Task.chain, exports.chain, 'Task.chain is exports.chain')
  test.equal(Task.capture, exports.capture, 'Task.capture is exports.capture')
  test.equal(Task.format, exports.format, 'Task.format is exporcts.format')
  test.equal(Task.recover, exports.recover, 'Task.recover is exporcts.recover')
  test.equal(Task.map, exports.map, 'Task.map is exports.map')
  test.equal(Task.map2, exports.map2, 'Task.map2 is exports.map2')
  test.equal(Task.map3, exports.map3, 'Task.map3 is exports.map3')
  test.equal(Task.map4, exports.map4, 'Task.map4 is exports.map4')
  test.equal(Task.map5, exports.map5, 'Task.map5 is exports.map5')
  test.equal(Task.sequence, exports.sequence,
            'Task.sequence is exports.sequence')

  const prototype = Task.prototype
  test.ok(isFunction(prototype.fork), '.fork is method')
  test.ok(isFunction(prototype.abort), '.abort is method')
  test.ok(isFunction(prototype.spawn), '.spawn is method')
  test.ok(isFunction(prototype.execute), '.execute is method')
  test.ok(isFunction(prototype.chain), '.chain is method')
  test.ok(isFunction(prototype.map), '.map is method')
  test.ok(isFunction(prototype.capture), '.capture is method')
  test.ok(isFunction(prototype.format), '.format is method')
  test.ok(isFunction(prototype.recover), '.recover is method')

  test.end()
})

test('test isTask', test => {
  const {Task} = TaskModule

  test.ok(!Task.isTask(null))
  test.ok(!Task.isTask({}))
  test.ok(!Task.isTask(6))
  test.ok(Task.isTask(Task.succeed(5)))
  test.ok(Task.isTask(new Task((onFail, onSucceed) => void (0))))
  test.ok(Task.isTask(Task.fail('Boom!')))
  test.ok(Task.isTask(Task.succeed(5)))
  test.ok(Task.isTask(Task.succeed(4).map(String)))
  test.ok(Task.isTask(Task.succeed(4).chain(_ => Task.succeed(5))))
  test.ok(Task.isTask(Task.fail(5).map(String)))
  test.ok(Task.isTask(Task.fail(5).chain(_ => Task.succeed(4))))
  test.ok(Task.isTask(Task.fail(5).format(String)))
  test.ok(Task.isTask(Task.fail(5).capture(_ => Task.succeed(5))))

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
