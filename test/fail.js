/* @flow */

import Task from '../'
import test from 'tape'

test('test fail', test => {
  Task.fail(5)
  .fork(value => {
    test.fail('Should have failed')
    test.end()
  }
  , error => {
    test.isEqual(error, 5)
    test.end()
  }
  )
})
