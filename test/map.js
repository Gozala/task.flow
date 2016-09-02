/* @flow */

import Task from '../'
import test from 'tape'

test('test task success mapped twice', test => {
  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  const onFail = error => {
    test.fail('Should not fail', error)
    test.end()
  }

  new Task((succeed, fail) => {
    succeed(4)
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onSucceed, onFail)
})

test('test task failure mapped twice', test => {
  const onSucceed = value => {
    test.fail('Should not succeed')
    test.end()
  }

  const onFail = error => {
    test.isEqual(error, 'Boom!')
    test.end()
  }

  new Task((succeed, fail) => {
    fail('Boom!')
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onSucceed, onFail)
})

test('test task map via function', test => {
  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  const onFail = error => {
    test.fail('Should not fail', error)
    test.end()
  }

  const task1 = new Task((succeed, fail) => {
    succeed(4)
  })
  const task2 = Task.map(x => x + 10, task1)
  const task3 = Task.map(x => x + 1, task2)
  task3.fork(onSucceed, onFail)
})
