/* @flow */

import type {Task} from ".."
import test from "tape"
import
  { fork
  , perform
  , succeed
  , fail
  , task
  , act
  , future
  , map
  , format
  , chain
  , capture
  , map2
  } from ".."

test("test succeed", test => {
  succeed(5)
  .fork
  ( error => {
      test.fail("Should not error")
      test.end()
    }
  , value => {
      test.isEqual(value, 5)
      test.end()
    }
  )
})


test("test fail", test => {
  fail(5)
  .fork
  ( error => {
      test.isEqual(error, 5)
      test.end()
    }
  , value => {
      test.fail("Should have failed")
      test.end()
    }
  )
})

test("test fork succeeded several times", test => {
  let succeeded = 0

  const task = succeed(5)

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 5)
    succeeded = succeeded + 1
    if (succeeded == 3) {
      test.end()
    }
  }

  task.fork(onFail, onSucceed)
  task.fork(onFail, onSucceed)
  task.fork(onFail, onSucceed)
})


test("test .chain", test => {
  const task =
    succeed(5)
    .chain(x => succeed(x + 10))

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})

test("test .chain & to fail", test => {
  const task =
    succeed(5)
    .chain(x => fail(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test .chain task -> fail -> succeed", test => {
  const task =
    succeed(5)
    .chain(x => fail(x + 10))
    .chain(x => succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})

test("test .chain task -> succeed -> succeed -> succeeed", test => {
  const double = x => x * 2
  const task =
    succeed(2)
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))

  const onSucceed = value => {
    test.isEqual(value, 16)
    test.end()
  }

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test succeed -> succeed -> succeed ->", test => {
  const double = x => x * 2
  const task =
    succeed(2)
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))

  const onSucceed = value => {
    test.isEqual(value, 16)
    test.end()
  }

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test .fail -> .chain", test => {
  const task =
    fail('Boom')
    .chain(x => succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 'Boom')
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test .fail -> .capture", test => {
  const task =
    fail('Boom')
    .capture(x => succeed(`!${x}`))

  const onSucceed = value => {
    test.isEqual(value, '!Boom')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeed')
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test task() succeed", test => {
  let calls = 0
  let asserts = 0
  const hi = task((fail, succeed) => {
    calls = calls + 1
    succeed({message: "hello"})
  })

  const onSucceed = value => {
    test.isEquivalent(value, {message: "hello"})
    asserts = asserts + 1
    test.isEqual(calls, asserts)

    if (calls === 3) {
      test.end()
    }
  }

  const onFail = error => {
    test.fail('Should have succeeed')
    test.end()
  }

  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
})


test("test task() failed", test => {
  let calls = 0
  let asserts = 0
  const hi = task((fail, succeed) => {
    calls = calls + 1
    fail({message: "Oops"})
  })

  const onFail = error => {
    test.isEquivalent(error, {message: "Oops"})
    asserts = asserts + 1
    test.isEqual(calls, asserts)

    if (calls === 3) {
      test.end()
    }
  }

  const onSucceed = error => {
    test.fail('Should have failed')
    test.end()
  }

  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
})
