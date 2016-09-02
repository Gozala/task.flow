/* @flow */

import Task from '../'
import test from 'tape'

test('test fail(x).recover', test => {
  const task =
    Task
    .fail('Boom')
    .recover(x => `!${x}`)

  const onSucceed = value => {
    test.isEqual(value, '!Boom')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeed', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test succeed(x).recover', test => {
  const task =
    Task
    .succeed(5)
    .recover(x => {
      test.fail('recover should not run unless task failed')
      return x
    })

  const onSucceed = value => {
    test.isEqual(value, 5)
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeed', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test fail(x).recover(a).recover(b)', test => {
  const task =
    Task
      .fail('Boom')
      .recover(x => `${x}!`)
      .recover(x => `${x}?`)

  const onSucceed = value => {
    test.equal(value, 'Boom!')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeded', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})
