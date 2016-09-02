/* @flow */

import Task from '../'
import test from 'tape'

test('test map3 succeed', test => {
  const onSucceed = value => {
    test.isEqual(value, 12)
    test.end()
  }

  const onFail = _ => {
    test.fail('Should have succeeded')
    test.end()
  }

  Task
    .map3((a, b, c) => a + b + c,
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5))
    .fork(onSucceed, onFail)
})

test('test map3 fail 1st', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map3((a, b, c) => a + b + c,
          Task.fail('first fail'),
          Task.succeed(4),
          Task.succeed(5))
    .fork(onSucceed, onFail)
})

test('test map3 fail 2nd', test => {
  const onFail = error => {
    test.isEqual(error, 'second fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map3((a, b, c) => a + b + c,
          Task.succeed(3),
          Task.fail('second fail'),
          Task.succeed(5))
    .fork(onSucceed, onFail)
})

test('test map3 fail 3rd', test => {
  const onFail = error => {
    test.isEqual(error, 'third fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map3((a, b, c) => a + b + c,
          Task.succeed(3),
          Task.succeed(4),
          Task.fail('third fail'))
    .fork(onSucceed, onFail)
})

test('test map3 fail all', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map3((a, b, c) => a + b + c,
          Task.fail('first fail'),
          Task.fail('second fail'),
          Task.fail('thrid fail'))
    .fork(onSucceed, onFail)
})
