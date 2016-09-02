/* @flow */

import Task from '../'
import test from 'tape'

test('test fail(x).capture(succeed)', test => {
  const task =
    Task.fail('Boom')
    .capture(x => Task.succeed(`!${x}`))

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

test('test succeed(x).capture', test => {
  const task =
    Task.succeed(5)
    .capture(x => {
      test.fail('Catpure should not run unless task failed')
      return Task.succeed(-5)
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

test('test fail(x).capture(fail).capture(fail)', test => {
  const task =
    Task
      .fail('Boom!')
      .capture(x => Task.fail(`${x}!`))
      .capture(x => Task.fail(`${x}!`))

  const onSucceed = value => {
    test.fail('Should have failed')
    test.end()
  }

  const onFail = error => {
    test.equal(error, 'Boom!!!')
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test fail(x).capture(fail).capture(succeed)', test => {
  const task =
    Task
      .fail('Boom!')
      .capture(x => Task.fail(`${x}!`))
      .capture(x => Task.succeed(`!${x}`))

  const onSucceed = value => {
    test.equal(value, '!Boom!!')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeded', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test('test fail(x).capture(succeed).capture(fail)', test => {
  const task =
    Task
      .fail('Boom!')
      .capture(x => Task.succeed(`!${x}`))
      .capture(x => Task.fail(`${x}!`))

  const onSucceed = value => {
    test.equal(value, '!Boom!')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeded', error)
    test.end()
  }

  task.fork(onSucceed, onFail)
})
