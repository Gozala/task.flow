/* @flow */

import Task from '../'
import test from 'tape'

test('test spawn', test => {
  const onMessage = message => {
    messages.push(message)
    if (messages.length === 2) {
      test.isEquivalent(messages, ['B', 'A'])

      test.end()
    }
    return message
  }

  const onSucceed = processes => {
    test.isEqual(processes.length, 2)

    test.isEqual(Task.isProcess(processes[0]), true)
    test.isEqual(Task.isProcess(processes[1]), true)

    test.isNotEqual(processes[0], processes[1])

    test.isEqual(messages.length, 0)
  }

  const onFail = _ => {
    test.fail('Not supposed to fail')
    test.end()
  }

  const messages = []

  const a = Task
    .sleep(20)
    .chain(_ => Task.succeed('A'))
    .map(onMessage)

  const b = Task
    .sleep(10)
    .chain(_ => Task.succeed('B'))
    .map(onMessage)

  const ab = Task.map2((a, b) => [a, b], a.spawn(), b.spawn())

  ab.fork(onSucceed, onFail)
})
