/* @flow */

import Task from '../'
import test from 'tape'

test('test sleep', test => {
  const onFail = error => {
    test.fail('Task.sleep never fails', error)
    test.end()
  }

  const onSucceed = value => {
    test.ok(value == null, 'Task.sleep succeeds with void')
    test.ok(Date.now() - start > 0, 'Task.sleep succeeds async')
    test.end()
  }

  Task
    .sleep(100)
    .fork(onSucceed, onFail)

  const start = Date.now()
})

test('test kill sleep', test => {
  let isKilled = false
  const onFail = error => {
    test.fail('Task.sleep never fails', error)
    test.end()
  }

  const onSucceed = value => {
    test.fail('Task.sleep does not succeed if killed', value)
    test.end()
  }

  const onKillFail = error => {
    test.fail('Process.kill never fails', error)
  }

  const onKillSucceed = value => {
    isKilled = true
    test.ok(value == null, 'Process.kill succeeds with void')
  }

  Task
    .sleep(100)
    .fork(onSucceed, onFail)
    .kill()
    .fork(onKillSucceed, onKillFail)

  setTimeout(() => {
    test.ok(isKilled)
    test.end()
  }, 500)
})
