/* @flow */

import Task from '../'
import test from 'tape'

test('test succeed', test => {
  Task
    .succeed(5)
    .fork(value => {
      test.isEqual(value, 5)
      test.end()
    }, error => {
      test.fail('Should not error', error)
      test.end()
    })
})
