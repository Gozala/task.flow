/* @flow */

import Task from '../'
import test from 'tape'

test('test succeed format', test => {
  const onFail = _ => {
    test.fail('Should have succeeded')
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 'data')
    test.end()
  }

  Task
    .succeed('data')
    .format(text => text.toUpperCase())
    .fork(onSucceed, onFail)
})

test('test fail format', test => {
  const onSucceed = _ => {
    test.fail('Should have failed')
  }

  const onFail = error => {
    test.isEqual(error, 'OOPS')
    test.end()
  }

  Task
    .fail('Oops')
    .format(text => text.toUpperCase())
    .fork(onSucceed, onFail)
})
