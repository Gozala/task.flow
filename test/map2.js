/* @flow */

import Task from '../'
import test from 'tape'

test('test map2 succeed', test => {
  const onSucceed = value => {
    test.isEqual(value, 7)
    test.end()
  }

  const onFail = _ => {
    test.fail('Should have succeeded')
    test.end()
  }

  Task
    .map2((a, b) => a + b, Task.succeed(3), Task.succeed(4))
    .fork(onSucceed, onFail)
})

test('test map2 fail 1st', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map2((a, b) => a + b, Task.fail('first fail'), Task.succeed(4))
    .fork(onSucceed, onFail)
})

test('test map2 fail 2nd', test => {
  const onFail = error => {
    test.isEqual(error, 'second fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map2((a, b) => a + b, Task.succeed(4), Task.fail('second fail'))
    .fork(onSucceed, onFail)
})

test('test map2 fail both', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map2((a, b) => a + b, Task.fail('first fail'), Task.fail('second fail'))
    .fork(onSucceed, onFail)
})
