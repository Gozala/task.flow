/* @flow */

import Task from '../'
import test from 'tape'

test('test suceeded(x).chain', test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.succeed(x + 10))

  const onFail = error => {
    test.fail('Should have succeeded', error)
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test failed(x).chain', test => {
  const task =
    Task
      .fail('Boom')
      .chain(x => Task.succeed(x + 10))

  const onSucceed = value => {
    test.fail('Should have failed', value)
    test.end()
  }

  const onFail = error => {
    test.isEqual(error, 'Boom')
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test return fail(x) from .chain', test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.fail(x + 10))

  const onSucceed = value => {
    test.fail('Should have failed', value)
    test.end()
  }

  const onFail = error => {
    test.isEqual(error, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test return fail() then succeed() from .chain', test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.fail(x + 10))
    .chain(x => Task.succeed(x + 10))

  const onSucceed = value => {
    test.fail('Should have failed', value)
    test.end()
  }

  const onFail = error => {
    test.isEqual(error, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test fail(e).chain(f).chain(g).chain(h)', test => {
  const double = x => x * 2
  const task =
    Task.fail('Boom')
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const onFail = error => {
    test.isEqual(error, 'Boom')
    test.end()
  }

  const onSucceed = value => {
    test.fail('Should have failed')
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test succeed(a).chain(f).chain(g).chain(h)', test => {
  const double = x => x * 2
  const task =
    Task.succeed(2)
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const onSucceed = value => {
    test.isEqual(value, 16)
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeded', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})
