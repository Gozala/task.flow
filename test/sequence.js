/* @flow */

import Task from '../'
import test from 'tape'

test('test sequence', test => {
  const onFail = _ => {
    test.fail('Should succeeded')
    test.end()
  }

  const onSucceed = value => {
    test.isEquivalent(value, [1, 2, 3])

    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3)
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence fail first', test => {
  const onFail = error => {
    test.equal(error, 'first')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  const task = Task.sequence([
    Task.fail('first'),
    Task.succeed(2),
    Task.succeed(3)
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence fail second', test => {
  const onFail = error => {
    test.equal(error, 'second')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.fail('second'),
    Task.succeed(3)
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence fail third', test => {
  const onFail = error => {
    test.equal(error, 'third')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.fail('third'),
    Task.succeed(3)
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence fail second & third', test => {
  const onFail = error => {
    test.equal(error, 'second')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.fail('second'),
    Task.fail('third')
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence of 12', test => {
  const onFail = _ => {
    test.fail('Should succeeded')
    test.end()
  }

  const onSucceed = value => {
    test.isEquivalent(value, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.succeed(6),
    Task.succeed(7),
    Task.succeed(8),
    Task.succeed(9),
    Task.succeed(10),
    Task.succeed(11),
    Task.succeed(12)
  ])

  task.fork(onSucceed, onFail)
})

test('test sequence of 12 with failed', test => {
  const onFail = error => {
    test.equal(error, 'sixth')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  const task = Task.sequence([
    Task.succeed(1),
    Task.succeed(2),
    Task.succeed(3),
    Task.succeed(4),
    Task.succeed(5),
    Task.fail('sixth'),
    Task.succeed(7),
    Task.succeed(8),
    Task.fail('nineth'),
    Task.succeed(10),
    Task.succeed(11),
    Task.succeed(12)
  ])

  task.fork(onSucceed, onFail)
})
