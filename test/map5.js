/* @flow */

import Task from '../'
import test from 'tape'

test('test map5 succeed', test => {
  const onSucceed = value => {
    test.isEqual(value, 25)
    test.end()
  }

  const onFail = _ => {
    test.fail('Should have succeeded')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5),
          Task.succeed(6),
          Task.succeed(7))
    .fork(onSucceed, onFail)
})

test('test map5 fail 1st', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.fail('first fail'),
          Task.succeed(4),
          Task.succeed(5),
          Task.succeed(6),
          Task.succeed(7))
    .fork(onSucceed, onFail)
})

test('test map5 fail 2nd', test => {
  const onFail = error => {
    test.isEqual(error, 'second fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.succeed(3),
          Task.fail('second fail'),
          Task.succeed(5),
          Task.succeed(6),
          Task.succeed(7))
    .fork(onSucceed, onFail)
})

test('test map5 fail 3rd', test => {
  const onFail = error => {
    test.isEqual(error, 'third fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.succeed(3),
          Task.succeed(4),
          Task.fail('third fail'),
          Task.succeed(6),
          Task.succeed(7))
    .fork(onSucceed, onFail)
})

test('test map5 fail 4th', test => {
  const onFail = error => {
    test.isEqual(error, 'fourth fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5),
          Task.fail('fourth fail'),
          Task.succeed(7))
    .fork(onSucceed, onFail)
})

test('test map5 fail 5th', test => {
  const onFail = error => {
    test.isEqual(error, 'fifth fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5),
          Task.succeed(6),
          Task.fail('fifth fail'))
    .fork(onSucceed, onFail)
})

test('test map5 fail all', test => {
  const onFail = error => {
    test.isEqual(error, 'first fail')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task
    .map5((a, b, c, d, e) => a + b + c + d + e,
          Task.fail('first fail'),
          Task.fail('second fail'),
          Task.fail('thrid fail'),
          Task.fail('fourth fail'),
          Task.fail('fifth fail'))
    .fork(onSucceed, onFail)
})
