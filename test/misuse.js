/* @flow */

import Task from '../'
import test from 'tape'

test('test if fail called twice second call is ignored', test => {
  const onFail = error => {
    test.ok(error instanceof Error)
    test.isEqual(error.message, 'Boom')
    test.end()
  }

  const onSucceed = value => {
    test.fail('Must have failed')
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    fail(Error('Boom'))
    fail(Error('BagaBoom'))
  })

  t1.fork(onSucceed, onFail)
})

test('test if succeeds called twice second call is ignored', test => {
  const onSucceed = value => {
    test.isEquivalent(value, { beep: 'bop', bar: 'baz' })
    test.end()
  }

  const onFail = error => {
    test.fail('Must have succeeded', error)
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    succeed({ beep: 'bop', bar: 'baz' })
    succeed(5)
  })

  t1.fork(onSucceed, onFail)
})

test('test task succeed, then fail is called later is ignored', test => {
  const onSucceed = value => {
    test.isEquivalent(value, { beep: 'bop', bar: 'baz' })
    test.end()
  }

  const onFail = error => {
    test.fail('Must have succeeded', error)
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    succeed({ beep: 'bop', bar: 'baz' })
    fail(5)
  })

  t1.fork(onSucceed, onFail)
})

test('test task fail, then succeed is called later is ignored', test => {
  const onFail = error => {
    test.ok(error instanceof Error)
    test.isEqual(error.message, 'Boom')
    test.end()
  }

  const onSucceed = value => {
    test.fail('Must have failed')
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    fail(Error('Boom'))
    succeed({data: 'text'})
  })

  t1.fork(onSucceed, onFail)
})
