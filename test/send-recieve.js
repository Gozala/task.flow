/* @flow */

import Task from '../'
import test from 'tape'

test('test send/receive', test => {
  const onReadSucceed = title => {
    test.equal(title, 'Hello')
    test.end()
  }

  const onReadFail = error => {
    test.fail('Task.receive should not fails', error)
  }

  const onWriteSucceed = value => {
    test.ok(value == null, 'Task.write suceeds with void')
  }

  const onWriteFail = value => {
    test.fail('Task.write should not fail')
  }

  Task
    .receive(message => Task.succeed(JSON.parse(message)))
    .map(data => data.title)
    .fork(onReadSucceed, onReadFail)
    .send('{"title": "Hello"}')
    .fork(onWriteSucceed, onWriteFail)
})
